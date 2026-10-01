/**
 * defines the data ormat of each movie as well as the
 * data format of the movie in varios situations
 */

export interface TmdbMedia {
	id: string;
	title: string;
	overview: string;
	posterPath: string;
	backdropPoster: string | null;
	voteAverage: string;
	releaseYear: string;
	originalCountry: string[];
	genreIds: string[];
	trailerKey?: string;
}

export type RegionCode = 'NG' | 'IN' | 'BG' | 'US' | 'FR' | 'AU';

export interface TmdbMediaCategory {
	id: string;
	label: string;
	type: 'story' | 'vibe' | 'setting';
	tmdbGenreId: string;
}
