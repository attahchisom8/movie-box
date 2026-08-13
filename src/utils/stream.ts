/**
 * This utulity handles queryinh spi for wstchable or downloadable movies
 * and trailer
 */

import  {StreamResolutionResult, ResolvedStream} from "@/types/stream.types";
import { TMDB_MOVIE_BASE_URL } from "@/utils/constants";
const TMDB_TOKEN = process.env.TMDB_TOKEN;

export const getMovieStream = async (
	movieId: string,
	title?: string = "",
	releaseYear?: string = "",
	intent?: "watch" | "download" = "watch"
): Promise<StreamResolutionResult> => {
	let streamResult: StreamResolutionResult;
	let stream: ResolvedStream | null;
	const primaryApi = "https://vidsrc.embed.su";
	const consumetApi = "https://api.cosumet.org/movovies/flixhq";
	const archiveApi = "https://archive.org";


	const getFromPrimarySource = async (): Promise<ResolvedStream | null> => {
		let primaryStream: ResolvedStream;
		if (!movieId)
			return null;
		try {
			const res = await fetch(`${primaryUrl}/${movieId}`);
			if (!res)
				return null;
			const data = res.json();
			if (intent === "download" && !data.downloadUrl)
				return null;
			primaryStream = {
				provider: "vidsrc",
				streamUrl: `${primaryApi}/${movieId}`,
				downloadUrl: data.downloadUrl,
				isEmbedded: true,
				quality: data.quality
			}

			return primaryStream;
		} catch(err: any) {
			console.error("[Primary Source Err]: failed to fetch data from primary source: ", err);
			return null;
		}
	}

	const getFromConsumet = async (): Promise<ResolvedStream | null> => {
		let consumetStream: ResolvedStream;

		if (!title)
			return null;

		try {
			const res = await fetch(`${consumetApi}/${title}`);
			if (!res)
				return null;
			const data = res.json();
			if (intent === "download" && !data.downloadUrl)
				return null;
			consumetStream = {
				provider: "consumet",
				streamUrl: `${consumetApi}/${movieId}`,
				downloadUrl: data.downloadUrl,
				isEmbedded: false,
				quality: data.quality
			}

			return consumetStream;
		} catch(err: any) {
			console.error("[CONSUMET API ERROR]: Failed to fetch data ffrom consumet source: ", err);
			return null;
		}
	}

	const getFromArchive = async (): Promise<ResolvedStream | null> => {
		let archiveStream: ResolvedStream;

		if (!title)
			return null;
		try {
			const res = await fetch(`${archiveApi}/${movieId}`);
			if (!res)
				return null;
			const data = res.json();
			if (intent === "download" && !data.downloadUrl)
				return null;
			archiveStream = {
				provider: "vidsrc",
				streamUrl: `${primaryApi}/${movieId}`,
				downloadUrl: data.downloadUrl,
				isEmbedded: true,
				quality: data.quality
			}

			return archiveStream;
		} catch(err: any) {
			console.error("[Archive Source Err]: failed to fetch data from archive source: ", err);
			return null;
	}

	const getTrailer = async (): Promise<ResolvedStream | null> => {
		let trailerStream: ResolvedStream;

		if (!movieId)
			return null;

		try {
			const res = await fetch(`${TMDB_MOVIE_BASE_URL}/trailer/${movieId}`, {
				headers: {Authorization: `Bearer ${TMDB_TOKEN}`}
			});
			if (!res)
				return null;
			const data = res.json();

			trailerStream = {
				provider: "youtube",
				streamUrl: data.youtubeUrl,
				isEmbedded: true,
				trailerKey?: data.trailerKey,
				quality: data.quality
			}

			return trailerStream;
		} catch(err: any) {
			console.error("[Youtube API ERROR]: Failed to fetch data ffrom youtube source: ", err);
			streamResult = {
				success: false,
				errMessage: err,
				intent,
			}
			return null;
		}
	}

	stream = await getFromPrimarySource();
	if (!stream) {
		stream = await getFromConsumet();
		if (!stream) {
			stream = await getFromArchive();
			if (!stream) {
				stream = await getTrailer();
				if (!stream) {
					return streamResult;
				}
			}
		}
	}

	streamResult = {
		success: true,
		stream,
		intent,
	}

	return streamResult;
}