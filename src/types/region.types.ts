/**
 * define the shape of reional data flow
 */

import { ECDH } from "crypto";
import { EOF } from "dns";

export interface RegionDataType {
	id: string,
	isoCode: string,
	displayName: string,
	genreIds: number[],
}

export interface GenreLibType {
	story: Record<string, number>,
	'vibe': Record<string, number>,
	'setting': Record<string, number>,
}