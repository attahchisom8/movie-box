/**
 * 	a debounce js an utility function that can help us overcome
 * rate limit by reducing the number of call we make to an api
 * per sedond
 * we have two types of this function
 * --trailing debounce - this fures a request only once after the user has
 * not typed for a certain time in miliseconds
 * --leading debounce - this fires at the very start of the request every
 * other subsequent request are ignored
 * @param callbackFunc - a function that accept a list of arbitrary arv and
 * returns anything. it aslo the sole function that makes the request
 * @param delay: how long to wait in miliseconds of non api request
 * @param option: An object that holds vALUES that determine if the is trailing,
 * leading or both
 * 
 * Rrturn: a function whose return type is anythihg
 */

import { BlockquoteHTMLAttributes } from "react";

interface Option {
	leading?: boolean;
	trailing?: boolean;
}

export interface debounceFunction <M extends (...args: any[]) => any> {
	(...args: Parameters<M>): void;
	cancel: () => void;
}

export const debounce = <T extends (...args: any[]) => any>(
	callbackFunc: T,
	delay: number,
	option: Option = {}
): debounceFunction<T> => {
	let timeRef: ReturnType<typeof setTimeout> | null = null;
	const {leading = false, trailing = true} = option;
	let lastArgs: Parameters<T> | null = null;
	
	const fn = (...args: Parameters<T>): void => {
		const isFIrstCall = !timeRef;
		lastArgs = args;

		if (timeRef) {
				clearTimeout(timeRef);
			}

		if (isFIrstCall && leading) {
			callbackFunc(...args);
			lastArgs = null;
		}

		timeRef = setTimeout(() => {
			timeRef = null;

			if (trailing && lastArgs) {
				callbackFunc(...lastArgs);
				lastArgs = null;
			}
		}, delay);
	}

	fn.cancel = () => {
		if (timeRef) {
			clearTimeout(timeRef);
			timeRef = null;
		}
		lastArgs = null;
	}

	return fn;
}


const  searchFound = (query: string) => {
	console.log(` ${query} is true`);
}

const debounceSearch = debounce(searchFound, 300);

console.log("simulating rapis user typing...");
debounceSearch("Gos is");
debounceSearch("God is found");
debounceSearch("God is found in Jesus christ");
