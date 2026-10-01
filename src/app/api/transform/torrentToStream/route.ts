/**
 * Thus mmioule converts a torreht stream to either a direct stream
 * for for playing on a web browser or into download chuks for direct downlosd
 */

import torrentStream from "torrent-stream";
import {NextRequest, NextResponse} from "next/server";


const getMimeType = (filename: string): string => {
	let mimeType = "video/mp4";

	if (/\.webm$/.test(filename))
		mimeType = "video/webm";
	else if (/\.3gp$/.test(filename))
		mimeType = "video/3gpp";
	else if (/\.mov$/.test(filename))
		mimeType = "video/quicktime";
	else if (/\.avi$/.test(filename))
		mimeType = "video/x-msvideo";
	else if (/\.ogv$/.test(filename))
		mimeType = "video/ogg";
	else if (/\.mkv$/.test(filename))
		mimeType = "video/x-matroska";

	return mimeType
}


export const translateTorrentMagnetUrlToStream = async (
	magnetUrl: string,
	intent: "watch" | "download",
	rangeHeader: string | null
): Promise<Response | null> => {
	return new Promise((resolve) => {
		if (!magnetUrl) {
			return resolve(null);
		}

		const engine = torrentStream(magnetUrl);

		engine.on("ready", () => {
			if (!engine?.files?.length)
				return resolve(null);

			const vidFiles = engine.files.filter((file: any) => {
				return /\.(mp4|mpeg4|mkv|m3u8|avi|ogv|webm|3gp|mov)/i.test(file.name);
			});
			if (!vidFiles?.length) {
				engine.destroy(() => {});
				return resolve(null);
			}

			const primaryFile = vidFiles.reduce((prev, current) => prev.length > current.length ?
			 prev : current);
			 let start = 0, end = primaryFile.length - 1;
			 if (rangeHeader && intent === "watch") {
				const streamRange = rangeHeader.replace(/bytes=/, "").split("-");
				start = parseInt(streamRange[0], 10);
				end = streamRange[1] ? parseInt(streamRange[1], 10) : end;
			 }
			 const sizeByteChunk = end - start + 1;

			// we create a nodejs stream
			const nodeStream = primaryFile.createReadStream({start, end});

			// convert the node stream to a web stream
			const webstream = new ReadableStream({
				start(controller) {
					nodeStream.on('data', (chunk: Buffer) => {
						/// sends nodejs stream to browswe in chunk of byte size
						controller.enqueue(new Uint8Array(chunk));
					});

					nodeStream.on('end', () => {
						controller.close();
					});

					nodeStream.on('error', (err: Error) => {
						controller.error(err);
						engine.destroy(() => {});
					});
				},
				cancel() {
					nodeStream.destroy();
					engine.destroy(() => {});
				}
			});
			const headers: Record<string, string> = {
				"Content-Type": getMimeType(primaryFile.name),
				"Content-Length": sizeByteChunk.toString(),
				"Accept-Ranges": "bytes",
			}

			let status = 200;

			if (rangeHeader && intent === "watch") {
				headers["Content-Range"] = `bytes ${start}-${end}/${primaryFile.length}`;
				status = 206;
			}

			if (intent === "download")
				headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(primaryFile.name)}"`;
	
			resolve(new Response(webstream, {status, headers}));
		});

		engine.on('error', () => {
			engine.destroy(() => {});
			return resolve(null);
		})
	})
}

export const GET = async (req: NextRequest): Promise<Response> => {
	try {
		const { searchParams } = new URL(req.url);
		const magnetUrl = searchParams.get('url');
		const intent = searchParams.get("intent") === "download" ? "download" : "watch";
		const rangeHeader = req.headers.get("range");
		if (!magnetUrl)
			return NextResponse.json(
		{"Error": "The term 'url=' not found in the request query"},
		{status: 400}
	);

		const dataStream = await translateTorrentMagnetUrlToStream(magnetUrl, intent, rangeHeader);
		if (!dataStream)
			return NextResponse.json(
		{"Error": "Unable to process torrent files or stream downloadable vidoes"},
		{status: 500}
		)

		return dataStream;
	} catch(err: any) {
		return NextResponse.json({"Error": err?.message || "internal server error"}, {status: 500});
	}
	
}