/** THIS module holds configuration types and interfaces */

import { VideoFormat, VideoQuality, StreamProvider } from "@/types/stream.types";
type Provider = Extract<StreamProvider, "archive" | "torrentio">

export type ConfigSize = "< 128mb" | "< 256mb" | "< 512mb" | "< 1024mb"
| "< 5120mb" | "default";

export interface MediaConfig {
	resolution?: VideoQuality;
	format?: VideoFormat;
	size?: ConfigSize;
	provider?: Provider;
}