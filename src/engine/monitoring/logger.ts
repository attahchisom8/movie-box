/**Tne aim of rhis module is to log all engine errors amd ecounters to a file for
 * proper track record
 */

import { ErrorLevel, StreamEngineError } from "@/types/error.types";
import { promises as fs } from "fs";
import path from "path"


export interface LogEntry {
	timestamp: string;
	level?: ErrorLevel;
	code: string;
	message: string;
	details: Record<string, any>;
	rawError: unknown;
}

const rootDir = process.cwd();


export const logger = {
	errorLogger: async (
		code: string,
		error: unknown,
		details: Record<string, any>,
		fileName: string
	): 	Promise<void> => {
		if (path.extname(fileName) !== ".log")
			throw new Error("All valid log file must have a '.log' extension");

		const message = error instanceof Error ? error.message : String(error);
			const stack = error instanceof Error ? error.stack : undefined;
			const level = error instanceof  StreamEngineError ? error.level : "ERROR";

			const logsDir = path.join(rootDir, "logs");
			const filePatn = path.join(logsDir, fileName);

			const logEntry : LogEntry = {
				timestamp: new Date().toISOString(),
				level,
				code,
				message,
				details: { ...details, stack},
				rawError: error
			};
			const content = JSON.stringify(logEntry) + "\n";


			try {
				await fs.mkdir(logsDir, {recursive: true});
				await fs.appendFile(filePatn, content, "utf8");
			} catch(writeError) {
				console.error(`[LOGGER_ERROR]: Failed to write logs to ${fileName}: `, writeError);
			}
	},
}
