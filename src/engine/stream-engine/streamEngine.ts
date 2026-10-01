import { fileParserSection } from "./fileParser.section";
import { reliableCalls } from "./reliableCalls.section";
import { streamResultManager } from "./streamResultManager.section";
import { errorBase } from "./errorBase.section";
import * as streamApi from "@/utils/stream"
import { MediaCategory } from "@/types/media.types";
import { ResolvedStream, StreamResolutionResult } from "@/types/stream.types";
import { ManagedErrorResult, StreamErrorCode } from "@/types/error.types";
import { Cedarville_Cursive } from "next/font/google";




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

	try {
		if (configData.err) {
			await errorBase.manageError(
				configData.err,
				{location: "fileParser section of the engine"}
			);
		}

		if (intent === "download") {
			const provider = configData.data?.config?.provider;
			if (provider) {
				if (provider === "archive") {
					resolvedStream = await reliableCalls(
						mediaObj,
						(data, signal) => streamApi.movieApis.getFromArchive(data, intent, signal),
						500
					);

					if (!resolvedStream) {
						throw errorBase.createSectionError(
							"Could not fetch downloadable stream from archive",
							StreamErrorCode.PROVIDER_FAILED,
							"PROVIDER_FAILED_TYPE_ERROR"
						)
					}
				} else {
					resolvedStream = await reliableCalls(
						mediaObj,
						(data, signal) => streamApi.movieApis.getFromTorrent(data, intent, signal),
						500
					);

					if (!resolvedStream) {
						throw errorBase.createSectionError(
							"Could not fetch downloadable stream from archive",
							StreamErrorCode.PROVIDER_FAILED,
							"PROVIDER_FAILED_TYPE_ERROR"
						)
					}
				}

				if (resolvedStream) {
						stream = {
					success: true,
					stream: resolvedStream,
					intent
					}
				}
			} else {
				resolvedStream = await reliableCalls(
						mediaObj,
						(data, signal) => streamApi.movieApis.getFromArchive(data, intent, signal),
						500
					);
					if (!resolvedStream) {
						resolvedStream = await reliableCalls(
							mediaObj,
							(data, signal) => streamApi.movieApis.getFromTorrent(data, intent, signal),
							500
						);
					}

					if (!resolvedStream) {
						throw errorBase.createSectionError(
							"Failed to resolve stream from the availaible downloadable stream sources",
							StreamErrorCode.PROVIDER_FAILED,
							"PROVIDER_FAILED_TYPE_ERROR"
						)
					}
			}

			stream = {success: true, stream: resolvedStream, intent}
		} else {
			stream = await reliableCalls(
				mediaObj,
				(mediaObj, signal) => streamApi.getMediaStream({mediaObj, intent}, signal),
				800
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
		const managed = await errorBase.manageError(
			engineErr,
			{location: "Error caught and processed at main engine site",
				mediaObj,
				intent
			}
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

await streamEngine(mediaObj, "watch");
