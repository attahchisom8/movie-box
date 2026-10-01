/**Tne aim of rhis module is to log all engine errors amd ecounters to a file for
 * proper track record
 */

import { promises as fs } from "fs";
import path from "path"


export interface LogEntry {
	timestamp: string;
	level: "INFO" | "WARN" | "ERROR";
	code: string;
	message: string;
	details: Record<string, any>;
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

			const logsDir = path.join(rootDir, "logs");
			const filePatn = path.join(logsDir, fileName);

			const logEntry : LogEntry= {
				timestamp: new Date().toISOString(),
				level: "ERROR",
				code,
				message,
				details: { ...details, stack}
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
