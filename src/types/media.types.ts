/**
 * THIs module defines movie structure and types
 */

export type MediaType = "movie" | "tv";

export interface MovieCategory {
	type: "movie",
	title?: string;
	movieId?: string;
	releaseYear?: string;
}

export interface TvCategory {
	type: "tv",
	showId: number;
	seasonNumber: number;
	episodeNumber: number;
}

export type MediaCategory = MovieCategory | TvCategory | null;
