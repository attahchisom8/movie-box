/** This utility helps us write data to a file */

import { promises as fs} from "fs";
import path from "path";

export const fileParser = {
	/** ffor writing data to a file */
	writeData: async (filePath: string,  data: any): Promise<boolean> => {
		if (!filePath || data === undefined || data === null)
			return false;

		const content = typeof data === "string" ? data : JSON.stringify(
			data, null, 2);
			try {
				await fs.writeFile(filePath, content,  "utf8");
				return true;
			} catch (err: any) {
				console.error(`Failed to write to '${path.basename(filePath)}': `, err);
				return false;
			}
	},

	/** for reading data from a file */
	readData: async <T>(filePath: string): Promise<null | T> => {
		if (!filePath)
			return null;
		try {
			const data = await fs.readFile(filePath, "utf8");
			return JSON.parse(data);
		} catch (err: any) {
			console.error(`Failed to read from '${path.basename(filePath)}': `, err);
			return null;
		}
	}
}
