/**  This module handle file parsing like reading and writing to a file */

import { fileParser } from "@/utils/fileParser";
import { MediaConfig } from "@/types/config.types";
import { promises as fs } from "fs";
import path from "path";
import { isDeepStrictEqual } from "util";
import { errorBase } from "./errorBase.section";
import { StreamEngineError, StreamErrorCode } from "@/types/error.types";
import { withCoalescedInvoke } from "next/dist/lib/coalesced-function";


export type FileData = {config: MediaConfig | null};

export interface writeResObj {
	success: boolean;
	dataAlreadyExists?: boolean;
	fileExists?: boolean;
	err?: StreamEngineError;
}

export interface ReadResObj {
	data?: FileData;
	err?: StreamEngineError;
}

const fileName = "media.config.json";
		const dirName = path.join(process.cwd(), "src", "config");
		const filePath = path.join(dirName, fileName);


export const fileParserSection = {
	/** Thus function is responsible for wriring configuration data to file
	 *
	 */
	writeToFile: async (data?: MediaConfig | null):  Promise<writeResObj> => {
		if (data === undefined) {
			return {
				success: false,
				err: errorBase.createSectionError(
					"No data provided",
					StreamErrorCode.CONFIG_WRITE_ERROR,
					"CONFIG_WRITE_TYPE_ERROR",
					undefined,
					"WARN"
				)
			}
		};

		try {
			await fs.mkdir(dirName, {recursive: true});

			let fileExists = true;
			try {
				await fs.access(filePath);
			} catch {
				fileExists = false;
			}

			let dataAlreadyExists = false, success = false, writeErr = null;
			let fileHandler: fs.FileHandle | null = null;
			if (!fileExists) {
				await fs.open(filePath, "a")
				.then((fd) => {
					fileExists = true;
					fileHandler = fd;
				})
				.finally(() => {
					if (fileHandler)
						fileHandler.close().catch((closeErr) => {
					console.error("[FileParser] Failed to close config file: ", closeErr);
					});
				})
				.catch((writeSectionErr: any) => writeErr = writeSectionErr);

				if (writeErr) {
					return {
						success: false,
						fileExists: false,
						err: errorBase.createSectionError(
							"Error occured where file is to be opened and written to",
							StreamErrorCode.CONFIG_WRITE_ERROR,
							"CONFIG_WRITE_TYPE_ERROR",
							writeErr
						),
					};
				}

			} else {
				const existingData = await fileParser.readData<FileData>(filePath);
				if (existingData?.config && isDeepStrictEqual(data, existingData.config)) {
					return {
						success: true,
						dataAlreadyExists: true,
						fileExists: true,
					}
				}
			}
			success = await fileParser.writeData(filePath, {config: data});

			return {
				success,
				dataAlreadyExists,
				fileExists,
			}
		} catch(writeSectionErr: any) {
			throw errorBase.createSectionError(
					"Failed to write user configurations to store",
					StreamErrorCode.CONFIG_WRITE_ERROR,
					"CONFIG_WRITE_TYPE_ERROR",
					writeSectionErr,
				);
		}
	},

	// We read data from a file
	readFromFile: async (): Promise<ReadResObj> => {
		try {
			await fs.access(filePath);
		} catch {
			return {
				data: { config: null },
				err: errorBase.createSectionError(
					`The file '${fileName}' doesn't exist`,
					StreamErrorCode.CONFIG_READ_ERROR,
					"CONFIG_READ_TYPE_ERROR",
					undefined,
					"WARN"
				)
			};
		};

		try {
			const data = await fileParser.readData<FileData>(filePath);
			
			return { data: data ?? {config: null}, };
		} catch (readSectionErr: any) {
			throw errorBase.createSectionError(
				"[StreamEngine_ReadSectionError]: Failed to read from from configuration"
				+ " file existing gracefully",
				StreamErrorCode.CONFIG_READ_ERROR,
				"CONFIG_READ_TYPE_ERROR",
				readSectionErr
			);
		}
	}
}


/*let data: MediaConfig | null = null;
data = {
	resolution: "4k",
	format: "m3u8",
	size: "< 256mb"
}
data = {
	resolution: "4k",
	format: "mp4",
	size: "< 256mb"
}
let res = await fileParserSection.writeToFile(data);
console.log(JSON.stringify(res, null, 2));

let readData = null;
readData = await fileParserSection.readFromFile()
console.log("readData: ",JSON.stringify(readData, null, 2));*/

