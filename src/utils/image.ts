/**
 * This utility helps get the full path of a tmdb image or
 * ot resort to a fallback image
 * @param path: path or tmmdb indexed filename of the image
 * @param size: this is the format of the image in size like poster w500
 */

import { TMDB_IMAGE_CDN_BASE, TMDB_IMAGE_BASE_URL } from '@/utils/constants';

type sizeType = keyof typeof TMDB_IMAGE_CDN_BASE | 'profile';

export const getImageCdn = (
	path: string | null | undefined,
	size: sizeType = "poster"
): string => {
	if (!path || path.trim() === "")
		return TMDB_IMAGE_CDN_BASE.fallbackPoster;

	if (path.startsWith("https") || path.startsWith("http"))
		return path;

	path = path.startsWith('/') ? path : '/' +  path;

	if (size === 'profile')
		return `${TMDB_IMAGE_BASE_URL}/w185${path}`;

		const baseURL = TMDB_IMAGE_CDN_BASE[size];
		if (!baseURL)
			return TMDB_IMAGE_CDN_BASE.fallbackPoster;
		// const formatedPath = path.startsWith('/') ? path : '/' +  path;

	return `${baseURL}${path}`;
}

/*console.log(getImageCdn("file1.jpg"));
console.log(getImageCdn("file2.jpg", "profile"));
console.log(getImageCdn("/file3.jpg", "poster"));
console.log(getImageCdn("file5.jpg", "backdrop"));
console.log(getImageCdn(null, "original"));*/
