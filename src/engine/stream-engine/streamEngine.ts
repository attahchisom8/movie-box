import { fileParserSection } from "./fileParser.section";
import { reliableCalls } from "./reliableCalls.section";
import { streamResultManager } from "./streamResultManager.section";
import { errorBase } from "./errorBase.section";
import * as streamApi from "@/utils/stream"
import { MediaCategory } from "@/types/media.types";
import { ResolvedStream, StreamProvider, StreamResolutionResult } from "@/types/stream.types";
import { ErrorLevel, StreamErrorCode, StreamEngineError } from "@/types/error.types";




/**
 * extractReasonFromError - This aimple function extracts error messages from
 * raw error
 * @param err: the  given error
 * @param defaultMessage: the fallback error message
 * @returns 
 */

const extractReasonFromError = (err: unknown, defaultMessage: string): string => {
	if (err instanceof Error)
		return err.message;

	if (typeof err === "string")
		return err;

	return defaultMessage;
}


/**
 * streamRngine - this is where the heavy duty work is performed to ensure a seamledd,
 * reliable video source is sent to the user based on peaasonal preferremces
 * @param mediaObj: an obj containing the data regarding users choice of neeeded stream
 * @param intent: the intent behind the requested movie
 * 
 * Return: a clean media strewam of valid sources
 */

export const streamEngine = async (
	mediaObj: MediaCategory,
	intent: "watch" | "download" = "watch"
): Promise<StreamResolutionResult> => {
	const configData = await fileParserSection.readFromFile();
	let stream: StreamResolutionResult | null = null;
	let resolvedStream: ResolvedStream | null = null;
	const failedProviders: {provider: StreamProvider, reason: string}[] = [];

	try {
		if (configData.err) {
			await errorBase.manageError(
				configData.err,
				{location: "fileParser section of the engine"},
				"WARN"
			);
		}

		if (intent === "download") {
			const provider = configData.data?.config?.provider;
			if (provider) {
				if (provider === "archive") {
					try {
						resolvedStream = await reliableCalls(
							mediaObj,
							(data, signal) => streamApi.movieApis.getFromArchive(data, intent, signal),
							12000
						);
					} catch(archErr: any) {
						failedProviders.push({
							provider: "archive",
							reason: extractReasonFromError(archErr,
							"The user's preference source 'archive' could not provide any "
							+ "downloadable stream")
						});
					}
				} else {
					try {
						resolvedStream = await reliableCalls(
							mediaObj,
							(data, signal) => streamApi.movieApis.getFromTorrent(data, intent, signal),
							15000
						);
					} catch(torrErr: any) {
						failedProviders.push({
							provider: "torrentio",
							reason: extractReasonFromError(torrErr,
							"The user's preference 'torrentio' could not provide any "
							+ "downloadable stream")
						});
					}
				}

			} else {
				try {
					resolvedStream = await reliableCalls(
							mediaObj,
							(data, signal) => streamApi.movieApis.getFromArchive(data, intent, signal),
							12000
					);
					} catch(archErr: any) {
						failedProviders.push({
							provider: "archive",
							reason: extractReasonFromError(archErr,
							"Unable fetch downloadable stream from archive"),
						});
				}

				if (!resolvedStream) {	
					try {
						resolvedStream = await reliableCalls(
							mediaObj,
							(data, signal) => streamApi.movieApis.getFromTorrent(data, intent, signal),
							15000
						);
					} catch(torrErr: any) {
						failedProviders.push({
							provider: "torrentio",
							reason: extractReasonFromError(torrErr,
							"Unable fetch downloadable stream from torrentio"),
						});
					}
				}
			}

			if (!resolvedStream) {
				throw errorBase.createSectionError(
					"Failed to resolve stream from the availaible downloadable stream sources",
					StreamErrorCode.PROVIDER_FAILED,
					"PROVIDER_FAILED_TYPE_ERROR",
					failedProviders,
				);
			}

			stream = {success: true, stream: resolvedStream, intent}
		} else {
			stream = await reliableCalls(
				mediaObj,
				(mediaObj, signal) => streamApi.getMediaStream({mediaObj, intent}, signal),
				18000
			);
		}

		if (!stream) {
			throw errorBase.createSectionError(
				"No streamable ffiles found among the available providers",
					StreamErrorCode.NO_STREAM_FOUND,
					"NO_STREAM_FOUND_TYPE_ERROR"
			)
		}

		if (!configData.data)
			return stream;

		return streamResultManager(stream, configData.data.config) || stream;
	} catch (engineErr) {
		console.error("[STREAM_ENGINE_ERROR]: ", engineErr);
		const level: ErrorLevel = engineErr instanceof StreamEngineError ?
		engineErr.level : "SEVERE";
		const managed = await errorBase.manageError(
			engineErr,
			{location: "Error caught and processed at main engine site",
				mediaObj,
				intent
			},
			level
		);

		return {
			success: false,
			errMessage: managed.usrMessage,
			errCode: managed.code
		}
	}
}


let mediaObj: MediaCategory = {
	type: "movie",
	movieId: "969681",
	releaseYear: "2020",
}

const stream = await streamEngine(mediaObj, "download");
console.log(JSON.stringify(stream, null, 2));

