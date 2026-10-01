/**
 * This utulity handles queryinh spi for watchable or downloadable movies
 * and trailer
 * Note: A single movie not a list of movies or seriee of episodes ar tne same
 * time
 */

import  * as STREAM from "@/types/stream.types";
import { TMDB_MOVIE_BASE_URL } from "@/utils/constants";
import dotenv from "dotenv";
import path from "path";
import * as 	MediaObj from "@/types/media.types";


dotenv.config({path: path.resolve(process.cwd(), ".env.local")});

const TMDB_TOKEN = process.env.TMDB_TOKEN;
// console.log("TMDB_TOKEN: ", TMDB_TOKEN);

const primaryApi = "https://vidsrc.to/embed";
	const archiveApi = "https://archive.org";
	const torrentApi = "https://torrentio.strem.fun/stream";

export const movieApis = {
	/**
	 * getembedded video strea from vidsrc,embed
	 */

	getFromPrimarySource: async (
		mediaObj: MediaObj.MediaCategory={type: "movie"},
		intent: "watch" | "download",
	): Promise<STREAM.ResolvedStream | null> => {
		if (!mediaObj)
			return null;

		if (intent === "download")
			return null;

		let type, showId, seasonNumber, episodeNumber, movieId, streamUrl;

		if (mediaObj.type === "movie") {
			movieId = mediaObj.movieId;
			type = mediaObj.type;
			streamUrl = `${primaryApi}/${type}/${movieId}`;
		} else {
			type = mediaObj.type;
			showId = mediaObj.showId;
			seasonNumber = mediaObj.seasonNumber;
			episodeNumber = mediaObj.episodeNumber;
			streamUrl = `${primaryApi}/${type}/${showId}/${seasonNumber}/${episodeNumber}`;
		}

		try {
			return {
				provider: "vidsrc",
				streamUrl,
				isEmbedded: true,
				quality: {
					resolution: "auto",
					format: "m3u8",
					url: streamUrl,
				},
				mediaType: type,
			}
		} catch(err: any) {
			throw new Error(`[Primary Source Err]: ${err.message || err}`);
		}
	},


	/**
	 * get movie amd tv series from torrent endpoinnt using tmdb id to get imdb id
	 * We use the imdb id tp get the torrent payload of the said video
	 */

	getFromTorrent: async (
		mediaObj: MediaObj.MediaCategory={type: "movie"},
		intent: "watch" | "download" = "watch",
		signal?: AbortSignal
	): Promise<STREAM.ResolvedStream | null> => {
		if (!mediaObj)
			return null;

		let tmdbId, tmdbExternalUrlIds, type, showId, seasonNumber, episodeNumber;

		if (mediaObj.type === "movie") {
			tmdbId = mediaObj.movieId;
			type = mediaObj.type;
			tmdbExternalUrlIds = `${TMDB_MOVIE_BASE_URL}/${type}/${tmdbId}/external_ids`;
		} else {
			showId  = mediaObj.showId;
			seasonNumber = mediaObj.seasonNumber;
			episodeNumber = mediaObj.episodeNumber;
			type = mediaObj.type;
			tmdbExternalUrlIds = `${TMDB_MOVIE_BASE_URL}/${type}/${showId}/external_ids`;
		}


		try {
			const res = await fetch(tmdbExternalUrlIds, {
				headers: {
					"Authorization": `Bearer ${TMDB_TOKEN}`,
					"Content-Type": "application/json"
				},
				signal
			});
			if (!res.ok)
				throw new Error(`IMDB external id look failed with HTTP status ${res.status}`);
			const data = await res.json();
			const imdbId = data.imdb_id;
			if (!imdbId)
				throw new Error("No imdb id found for title");

			let torrentRes;
			if (type === "movie")
				torrentRes = await fetch(`${torrentApi}/${type}/${imdbId}.json`, {signal});
			else
				torrentRes = await fetch(
			`${torrentApi}/series/${imdbId}:${seasonNumber}:${episodeNumber}.json`,
			{ signal }
		);

			if (!torrentRes.ok)
				throw new Error(`Torrent stream lookup failed with HTTP status ${torrentRes.status}`);
			const torrentData = await torrentRes.json();
			if (!torrentData?.streams?.length)
				throw new Error("No torrent record found for the title");

			const availableMediaInfos: STREAM.MediaInfo[] =
			torrentData.streams.map((s: any): STREAM.MediaInfo => {
				const text: string = `${s.name || ""} ${s.title || ""}`
				const qualityMatch: any[] | null = text.match(/(\d{3,4}p|2k|4k)/i);
				let quality = qualityMatch?.[1].replace("p", "").toLowerCase() || (
					(filename: string | null): string => {
						let quality = "720"
						if (!filename)
							return quality;
						if (/2160p|4k|uhd/i.test(filename))
							quality = "4k";
						else if (/1440p|qhd/i.test(filename))
							quality = "2k";
						else if (/1080p|fhd/i.test(filename))
							quality = "1080";
						else if (/720p|hd/i.test(filename))
							quality = "720";
						else if (/480p|sd/i.test(filename))
							quality = "480";
						else if (/360p|nhd/i.test(filename))
							quality = "360";

						return quality
						
					}
				)(s.behaviorHints?.filename);
				if (quality === "2160")
					quality = "4k";
				if (quality === "1440")
					quality = "2k";

				let sizeInMegaBytes = "unknown";
				const sizeMatch: any[] = s.title?.match(/(\d+\.?\d*)\s*(GB|MB)/i);
				if (sizeMatch) {
					const size = sizeMatch[1];
					const sizeRange = sizeMatch[2].toLowerCase();
					sizeInMegaBytes = sizeRange === "gb" ? (parseFloat(size) * 1024)
					.toFixed(0) : size;
				}
				const fileName = s.behaviorHints?.filename || (s.fileIdx !== undefined ? `file_${s.fileIdx}` : "");
				let ext = fileName?.match(/\.(mp4|mpeg4|mkv|m3u8|avi|ogv|webm|3gp|mov|zip)/i)?.[1] || "mp4";
				if (ext === "mpeg4" || ext === "MPEG4")
					ext = "mp4";

				const magnetTItle = fileName || s.title || imdbId
				let magnetUrl: string = `magnet:?xt=urn:btih:${s.infoHash}&dn=${encodeURIComponent(magnetTItle)}`;
				const trackers: string[] = [];
				if (Array.isArray(s.sources)) {
					s.sources.forEach((src: string) => {
						if (src.startsWith("tracker:"))
							trackers.push(src.replace("tracker:", ""));
					});
				}
				
				if (trackers.length === 0) {
					trackers.push(
						"udp://tracker.opentrackr.org:1337/announce",
            "udp://open.stealth.si:80/announce",
            "udp://tracker.torrent.eu.org:451/announce"
					);
				}

				trackers.forEach((ftr: string) => {
						magnetUrl += `&tr=${encodeURIComponent(ftr)}`;
					});
				const releaseYear = s.title?.match(/\b(19\d{2}|20\d{2})\b/)?.[1] || "";


				return {
					quality: quality as STREAM.VideoQuality,
					format: ext.toLowerCase() as STREAM.VideoFormat,
					url: magnetUrl,
					sizeInMegaBytes,
					title: s.title,
					fileName,
					releaseYear,
				}
			});

			const torrentInfo = availableMediaInfos.find((avf) => {
				return avf.quality === "1080"
			}) || availableMediaInfos[0];
			const quality: STREAM.Quality = {
				resolution: torrentInfo.quality,
				format: torrentInfo.format,
				url: torrentInfo.url
			}
			const encodedMagnetUrl = encodeURIComponent(torrentInfo.url);
			const streamUrl = `/api/transform/torrentToStream?url=${encodedMagnetUrl}&intent=watch`;
			const downloadUrl = `/api/transform/torrentToStream?url=${encodedMagnetUrl}&intent=download`;


			return {
				provider: "torrentio",
				streamUrl,
				downloadUrl,
				isEmbedded: false,
				mediaType: type,
				mediaInfo: torrentInfo,
				quality,
				availableMediaInfos,
			}
		} catch(err: any) {
			throw new Error(`[Torrent Source ERROR]: ${err?.message || err}`);
		}
	},


	/**
	 * This will fetch a movie stream from archive,org either watchable or
	 * downloadable stream
	 */

	getFromArchive: async (
		mediaObj: MediaObj.MediaCategory={type: "movie"},
		intent: "watch" | "download" = "watch",
		signal?: AbortSignal
	): Promise<STREAM.ResolvedStream | null> => {
		if (!mediaObj || mediaObj.type === "tv")
			return null;

		mediaObj = mediaObj as MediaObj.MovieCategory;
		const type = mediaObj.type;
		let title = mediaObj.title?.replace(/"/g, '\\"') || "";
		let queryParams = `title:("${title}") AND mediatype:(movies OR tv)`;
		if (mediaObj.releaseYear)
			queryParams += ` AND (year:("${mediaObj.releaseYear}") OR date:("${mediaObj.releaseYear}"))`;
		const searchUrl = `${archiveApi}/advancedsearch.php?q=${encodeURIComponent(queryParams)}&fl[]=identifier,title,year,downloads,format&sort[]=downloads+desc&output=json`;

		try {
			const res = await fetch(searchUrl, {signal});
			if (!res.ok)
				throw new Error(`Archive source lookup failed with HTTP status ${res.status}`);
			const data = await res.json();
			const response = data.response;
			if (!response?.docs?.length)
				throw new Error(`No archive records found for ${title}${mediaObj.releaseYear ? ` ${mediaObj.releaseYear}` : ""}`);
			const docs = response.docs;
			const media = mediaObj.releaseYear ? (
				docs.find((d: any) => String(mediaObj.releaseYear) === d.year.toString()) || docs[0]
			) : docs[0];
			const identifier = media?.identifier;
			if (!identifier)
				throw new Error("No identifier for the title found in the archive records");
			const metaRes = await fetch(`${archiveApi}/metadata/${identifier}/files`,
				{ signal }
			);
			const metaData = await metaRes?.json();
			if (!metaData?.result?.length)
				throw new Error("No metadata found for the archive identifier");
			const result = metaData.result;

			const vidRegex = /\.(mp4|m3u8|mkv|mov|webm|avi|3gp|ogv|zip)$/i;

			const playableVideos = result.filter((v: any) => {
				const formatTypes = ["MPEG4", "MKV", "M3U8", "AVI", "OGV", "WEBM", "3GP", "MOV", "ZIP"];
				const isFormat = formatTypes.includes(v.format);
				const hasNeededExtension = vidRegex.test(v.name);
				const isNotThumbnail = !v.name.includes("thumbs") && v.type !== "Thumbnail";

				return (hasNeededExtension || isFormat) && isNotThumbnail;
			});

			if (!playableVideos?.length)
				throw new Error("No playable videos available for the title");
			//console.log("PlayableVideos: ", JSON.stringify(playableVideos, null, 2));

			const mediaInfos: STREAM.MediaInfo[] = playableVideos.map((v: any): STREAM.MediaInfo | null => {
				let ext = v.name.split(".").pop()?.toLowerCase() || null;

				if (!ext || !vidRegex.test(v.name))
					ext = v.format?.toLowerCase() || null;


				if (ext === "mpeg4" || ext === "h.264 Ia")
					ext = "mp4";

				if (!ext)
					return null;

				const url = `${archiveApi}/download/${identifier}/${encodeURIComponent(v.name)}`;

				return {
					quality: v.height || "720",
					format: ext,
					url,
					duration: v.length || "unknown",
					sizeInMegaBytes: v.size ?
					(Number(v.size) / (1024 * 1024)).toFixed(0) : "unknown",
					releaseYear: media?.year.toString(),
					title: media?.title,
				}
			}).filter((q: any): q is STREAM.MediaInfo => q !== null);

				const defaultMediaInfo = mediaInfos.find((mf) => {
					return mf.quality === "1080"
				}) || mediaInfos[0];

			const downloadUrl = defaultMediaInfo.url;
			const quality: STREAM.Quality = {
				resolution: defaultMediaInfo.quality,
				format: defaultMediaInfo.format,
				url: defaultMediaInfo.url
			}

			return {
				provider: "archive",
				streamUrl: defaultMediaInfo.url,
				downloadUrl,
				isEmbedded: false,
				mediaType: type,
				mediaInfo: defaultMediaInfo,
				quality,
				availableMediaInfos: mediaInfos, 
			}
		} catch(err: any) {
			throw new Error(`[Archive Source Error]: ${err.message || err}`);
		}
	},


	/**
	 * This gets youtube trailer along with fhe key using using TMDB novieid
	 * including teasers
	 */

	getTrailer: async (
		mediaObj: MediaObj.MediaCategory={type: "movie"},
			signal?: AbortSignal
		): Promise<STREAM.ResolvedStream | null> => {
		if (!mediaObj)
			return null;

		let type, showId, seasonNumber, episodeNumber, movieId, streamUrl, url;

		if (mediaObj.type === "movie") {
			movieId = mediaObj.movieId;
			type = mediaObj.type;
			url = `${TMDB_MOVIE_BASE_URL}/${type}/${movieId}/videos`;
		} else {
			type = mediaObj.type;
			showId = mediaObj.showId;
			seasonNumber = mediaObj.seasonNumber;
			episodeNumber = mediaObj.episodeNumber;
			url = `${TMDB_MOVIE_BASE_URL}/${type}/${showId}/videos`;
		}

		try {
			const res = await fetch(url, {
				headers: {Authorization: `Bearer ${TMDB_TOKEN}`},
				signal
			});
			if (!res.ok)
				throw new Error(`TMDB trailer lookup failed with HTTP status ${res.status}`);

			const data = await res.json();
			if (!data.results?.length)
				throw new Error("No Youtube trailer records found for this TMDB lookup");

			const results = data.results;

			const trailer = results.find((t: any) => {
				return t.site === "YouTube" && (t.type === "Trailer" || t.type === "Teaser")
			});
			if (!trailer || !trailer.key)
				throw new Error("No youtube trailer key found");
			const trailerKey = trailer.key;

			return {
				provider: "youtube",
				streamUrl: `https://youtube.com/watch?v=${trailerKey}`,
				isEmbedded: true,
				trailerKey,
				quality: {
					resolution: trailer.size.toString(),
					format: "m3u8",
					url: `https://youtube.com/watch?v=${trailerKey}`,
				},
				mediaType: type,
			}
		} catch(err: any) {
			throw new Error(`[Youtube Source ERROR]: ${err.message || err}`);
		}
	}
}

export interface MediaInterface {
	mediaObj: MediaObj.MediaCategory,
	intent?: "watch" | "download"
}


export const getMediaStream = async ({
	mediaObj={type: "movie"},
	intent="watch"
} : MediaInterface,
signal?: AbortSignal
): Promise<STREAM.StreamResolutionResult> => {
	let stream: STREAM.ResolvedStream | null;
	const failedProviders: {provider: STREAM.StreamProvider, reason: string}[] = [];

	if (intent === "watch") {
		try {
			stream = await movieApis.getFromPrimarySource(mediaObj, intent);
			if (stream)
				return {success: true, stream, intent}
		} catch (err: any) {
			failedProviders.push({provider: "vidsrc", reason: err.message});
		}
	}

	try {
		stream = await movieApis.getFromArchive(mediaObj, intent, signal);
		if (stream)
			return {success: true, stream, intent};
	} catch (err: any) {
		failedProviders.push({provider: "archive", reason: err.message});
	}

	try {
		stream = await movieApis.getFromTorrent(mediaObj, intent, signal);
		if (stream)
			return {success: true, stream, intent};
	} catch (err: any) {
		failedProviders.push({provider: "torrentio", reason: err.message});
	}

	if (intent === "watch") {
		try {
			stream = await movieApis.getTrailer(mediaObj, signal);
			if (stream)
				return {success: true, stream, intent};
		} catch(err: any) {
			failedProviders.push({provider: "youtube", reason: err.message});
		}
	}

		
	return {
		success: false,
		intent,
		errMessage: intent === "download" ? 
		"No downloadable stream sources available for this title"
		: "Failed to fetch movie stream or trailer",
		failedProviders
	};
}

let mediaObj: MediaObj.MediaCategory = {
	type: "movie",
	movieId: "969681",
	releaseYear: "2020",
}

mediaObj = {
	type: "tv",
	showId: 2288,
	seasonNumber: 4,
	episodeNumber: 3
}

mediaObj = {
	type: "movie",
	title: "spiderman"
}
const movie =  await getMediaStream({mediaObj, intent: "download"});
console.log(JSON.stringify(movie, null, 2));
