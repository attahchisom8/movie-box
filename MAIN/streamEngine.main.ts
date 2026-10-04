/** Tesr stre<m ENGINE */

import { MediaCategory } from "@/types/media.types";
import { streamEngine } from "@/engine/stream-engine/streamEngine";

// Remove top-level execution from streamEngine.ts or wrap inside a self-invoking function during manual testing:

    async function runTest() {
			const mediaObj: MediaCategory = {
					type: "movie",
					movieId: "969681",
					releaseYear: "2020",
			};
			const stream = await streamEngine(mediaObj, "download");
			console.log(JSON.stringify(stream, null, 2));
			}

			runTest();
