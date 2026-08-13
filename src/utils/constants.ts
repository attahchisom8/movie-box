/**
 * A source of truth that contains configurations data, api mappins
 * and fallback values
 */

import { AccessibityTheme } from '@/types/theme.types';


export const REGIONAL_DATA = [
	{
		id: 'nollywood',
		isoCode: 'NG',
		displayName: 'NollyWood',
		genreIds: [35, 18, 10749] // comwedy, drana, romance
	},
	{
		id: 'hollwood',
		isoCode: 'US',
		displayName: 'Hollywood',
		genreIds: [28, 12, 53, 878, 14, 1233, 10749, 27, 16, 10752],
	},
	{
		id: 'bollywood',
		isoCode: 'IN',
		displayName: 'Bollywood',
		genreIds: [28, 10749, 35, 9648, 27, 10751],
	},
	{
		id: 'k_drama',
		isoCode: 'KR',
		displayName: 'K_Drama', // Hallyuwood
		genreIds: [18, 12, 10749, 35],
	},
	{
		id: 'cn',
		isoCode: 'CN',
		displayName: 'C_DRAMA', // Chollywood
		genreIds: [18, 12, 10749, 35],
	},
	{
		id: "au",
		isoCode: 'AU',
		displayName: "Australian Cinema",
		genreIds: [28, 12, 35, 27, 10749],
	},
	{
		id: 'fr',
		isoCode: 'FR',
		displayName: 'France cinema',
		genreIds: [28, 18, 36, 35, 9715],
	},
	{
		id: 'GB',
		isoCode: 'GB',
		displayName: 'Britwood',
		genreIds: [28, 12, 53, 878, 14, 1233, 10749, 27, 16, 16, 10770, 10752,2064],
	}
] as const;


export const REGION_BY_ISO_CODE = new Map(
	REGIONAL_DATA.map((d) => [d.isoCode, d])
);


// Genre dictionary

export const GENRE_LIB = {
	story: {
		'action': 28,
		'adventure' : 12,
		'comedy' : 35,
		'crime' : 80,
		'drama' : 18,
		'traier' : 53,
		'Tv movie': 10770,
	},
	vibe: {
		romance: 10749,
		mystery: 9648,
		horror: 27,
		animation: 16,
		'family': 10751,
	},
	setting: {
		'sci-fi': 878,
		'fantasy': 14,
		'western': 37,
		'Documentry': 99,
		'history': 36,
		war: 10752,

	}
} as const;

export const GENRE_NAME_BY_ID: Record<number, string> = {};
for (const category of Object.values(GENRE_LIB)) {
	Object.entries(category)
		.forEach(([name, id]) => GENRE_NAME_BY_ID[Number(id)] = name);
}

// console.log(JSON.stringify(GENRE_NAME_BY_ID, null, 2));


// TMDB DEFAULT URL
export const TMDB_MOVIE_BASE_URL = 'https://api.tmdb.org/3' as const;
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p' as const;


// Here we handletmdb image connfigutation

export const TMDB_IMAGE_CDN_BASE = {
	poster: `${TMDB_IMAGE_BASE_URL}/w500`,
	backdrop: `${TMDB_IMAGE_BASE_URL}/w1280`,
	original: `${TMDB_IMAGE_BASE_URL}/original`,
	fallbackPoster: `/images/placeholder.svg`,
} as const;


// theme setting and pretext

export const DEFAULT_THEME: AccessibityTheme = {
	textColor: '#fff',
	bgColor: '#172155',
	fontSize: 16,
	fontWeight: 600,
	fontFamily: ['sans' ,'Georgia', 'Helvetica Neue'],
	letterSpacing: -1.5,
} as const;


export const ACCESSIBILTY_PRESET_THEME: AccessibityTheme = {
	textColor: "#ffff00",
	bgColor: "#000",
	fontSize: 18,
	fontWeight: 700,
	fontFamily: ['sans', 'OPenDyslexic'],
	letterSpacing: 1.5,
}