/**
 * This utility is responsible for storing datsa ot data
 * pesistence like theme custom settings, configurations etc
 * @param key: the key name of the object
 * @param fallBackValue:  A generic ohject that the spp fall back
 * to when data is not available or an error occurs
 */

// creating a mock localstorage for node env. typeof window is always undefined
// in node
// we are mocking the browsers localStotage

if (typeof window === "undefined") {
	const mockstorage: Record<string, string> = {};
	(global as any).window = {
		localStorage: {
			getItem: (k: string) => mockstorage[k] ?? null,
			setItem: (k: String, v: string) => {mockstorage[k] = v},
			removeItem: (k: string) => {delete mockstorage[k]},
		}
	};
};


export const store = {
	/**
	 * Read and parse data from storage into the type/format of the data
	 * @param key: THe unique key that unlocks the required data from storage
	 * @param fallBackValue: use this if data is not available or an error occurs
	 *
	 * @returns: The required data in its structure
	 */
	getFromStore: <T>(key: string | null, fallBackValue: T): T => {
		if (typeof window === "undefined")
			return fallBackValue;

		try {
			if (!key)
				return fallBackValue;
			const result = window.localStorage.getItem(key);
			if (!result)
				return fallBackValue;

			return JSON.parse(result) as T;
		} catch(err: any) {
			console.error(`[Storage]: Unable to read from store with the key: "${key}" ->\n`, err);
			return fallBackValue;
		}
	},

	/**
	 * This fundtion serializes and writes data to the storage
	 * @param key: The unique key to which we want our data to be accessed
	 * @param value: the value we want to commit to memory
	 *
	 * @returns: boolean
	 */
	saveToStore: <T>(key: string, value: T): boolean => {
		if (typeof window === "undefined" || !key)
			return false;

		try{
			const serializedValue = JSON.stringify(value);
			window.localStorage.setItem(key, serializedValue);
			return true;
		} catch(err: any) {
		if (err.name === "QuotaExceededError" || err?.code === 22) {
			console.log("[Storage]: Quota Exceeded Error");
			return false;
		}
		console.error(`[Storage]: Failed to write to store with the key: ${key}: -->\n`, err);
		return false;
		}
	},

	/**
	 * renoves the data along with corresponding key from the store
	 * @param key: The unique key that have access to the data
	 *
	 * @returns: void
	 */

	removeFromStore: (key: string) => {
		if (!key || typeof window === "undefined")
			return;

		try {
			window.localStorage.removeItem(key);
		} catch (err: any) {
			console.error(`[Storage]: Unable to remove item with key: "${key}" from store`);
		}
	}
}

import { DEFAULT_THEME } from "@/utils/constants";

const j = JSON.stringify;
let activeTheme = store.getFromStore("moviebox-theme", DEFAULT_THEME);
console.log(j(activeTheme, null, 2));

store.saveToStore("moviebox-theme", {...activeTheme, fontSize: 19});
const activeTheme2 = store.getFromStore("moviebox-theme", DEFAULT_THEME);
console.log(j(activeTheme2, null, 2));