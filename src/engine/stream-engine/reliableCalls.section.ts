/** This section of the engine ensures that a call to an endpoint is reliable
 * by ensuring the query time dont exceed 500ms
 */

import { StreamErrorCode } from "@/types/error.types";
import { errorBase } from "./errorBase.section";


type QueryFunc<A, T> = (data: A, signal?: AbortSignal) => Promise<T | null>;

export const reliableCalls = async <A, T>(
	data: A,
	queryFunc: QueryFunc<A, T>,
	timeMs: number = 500
): Promise<T | null> => {
	const abortController = new AbortController();

	const timerPromise = new Promise<null>((resolve, reject) => {
		setTimeout(() => {
			abortController.abort();
			resolve(null);

			reject(errorBase.createSectionError(
				`an error occured while resolving query, query aborted in ${timeMs}`,
				StreamErrorCode.TIMEOUT,
				"TIMEOUT_TYPE_ERROR"
			))
		}, timeMs);
	});

	try {
		// the race resolves to the first item in the list that resolves first
		const result = await Promise.race([
			queryFunc(data, abortController.signal),
			timerPromise
		]);

		return result;
	} catch(reliableCallErr: any) {
		throw errorBase.createSectionError(
			"Could not resolve host server, query aborted due to timeout error",
			StreamErrorCode.TIMEOUT,
			"TIMEOUT_TYPE_ERROR",
			reliableCallErr,
		);
	}
}