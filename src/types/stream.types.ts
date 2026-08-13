/**
 * defines the nature of data from streaming. theur sources
 * and how they should work
 */

export type StreamProvider = 'vidsrc' | 'archive' | 'consumet' | 'youtube';
export type VideoQuality = "360p" | "480p" | "720p" | "1080p" | "2160p" | "auto";
export type VideoFormat = "mp4" | "m3u8" | "mkv";

export interface QualityOption {
	quality: VideoQuality;
	format: VideoFormat;
	url: string;
	sizeInBytes?: number;
}

export interface ResolvedStream {
	provider: StreamProvider;
	streamUrl: string;
	downloadUrl?: string;
	isEmbedded: boolean;
	trailerKey?: string;
	quality: QualityOption;
	avaliableQuality?: QualityOption[];
}

export interface StreamResolutionResult {
	success: boolean;
	stream?: ResolvedStream;
	intent?: "watch" | "download";
	errMessage?: string;
}
