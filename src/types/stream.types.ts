/**
 * defines the nature of data from streaming. theur sources
 * and how they should work
 */

import { MediaType } from "./media.types";

export type StreamProvider = 'vidsrc' | 'archive' | 'torrentio' | 'youtube';
export type VideoQuality = "360" | "480" | "720" | "1080" | "1440" | "2k" | "2160" | "4k" | "auto";
export type VideoFormat = "mp4" | "m3u8" | "mkv" | "mov" | "webm" |
"avi" | "3gp" | "ogv" | "zip";

export interface Quality {
	resolution: VideoQuality;
	format: VideoFormat;
	url: string;
}

export interface MediaInfo {
	quality: VideoQuality;
	format: VideoFormat;
	url: string;
	duration?: string;
	sizeInMegaBytes?: string;
	fileName?: string;
	releaseYear?: string;
	title?: string;
}

export interface Subtitles {
	fileUrl: string;
	lang: string;
	label: string;
	format: string;
}


export interface ResolvedStream {
	provider: StreamProvider;
	streamUrl: string;
	downloadUrl?: any;
	isEmbedded: boolean;
	trailerKey?: string;
	mediaType: MediaType;
	mediaInfo?: MediaInfo;
	quality: Quality;
	availableMediaInfos?: MediaInfo[];
	subtitles?: Subtitles[]
}

export interface StreamResolutionResult {
	success: boolean;
	stream?: ResolvedStream;
	intent?: "watch" | "download";
	errMessage?: string;
	errCode?: string;
	failedProviders?: {provider: StreamProvider; reason: any}[];
}
