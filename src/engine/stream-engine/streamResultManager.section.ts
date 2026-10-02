import { MediaInfo, StreamResolutionResult } from "@/types/stream.types";
import { MediaConfig } from "@/types/config.types";



export const streamResultManager = (
	stream: StreamResolutionResult | null,
	data: MediaConfig | null
): StreamResolutionResult | null => {
	if (!stream)
		return null;

	if (!data || !stream.stream)
		return stream;

	const { availableMediaInfos } = stream.stream;
	if (!availableMediaInfos?.length)
		return stream;

  const priorityArr = availableMediaInfos.map((item) => {
    const priority = getPriority(item, data);
    const seeders = getSeeders(item);

    return {item, priority, seeders};
  })
	
  priorityArr.sort((a, b): number => {
    if (a.priority === b.priority) {
      return b.seeders - a.seeders;
    }

    return b.priority - a.priority;
  });

  const sortedArr = priorityArr.map((p) => p.item);
	if (!sortedArr?.length)
		return stream;


const mediaInfo = sortedArr[0];
  let [streamUrl, downloadUrl] = [mediaInfo.url, mediaInfo.url];
	if (stream.stream.provider === "torrentio" || mediaInfo.url.startsWith(":magnet")) {
		const encodedMagnetUrl = encodeURIComponent(mediaInfo.url);
			streamUrl = `/api/transform/torrentToStream?url=${encodedMagnetUrl}&intent=watch`;
			downloadUrl = `/api/transform/torrentToStream?url=${encodedMagnetUrl}&intent=download`;
	}

	return {
		...stream,
		stream: {
			...stream.stream,
			streamUrl,
			downloadUrl,
			isEmbedded: false,
			mediaInfo,
			quality: {
				resolution: mediaInfo.quality,
				format: mediaInfo.format,
				url: mediaInfo.url
			},
			availableMediaInfos: sortedArr,
		},
	}
}


const getPriority = (item: MediaInfo, config: MediaConfig): number => {
  let priority = 0;

  if (config.resolution && config.resolution === item.quality)
    priority += 5;

  if (config.format && config.format === item.format)
    priority += 3;

  if (config.size && config.size !== "default") {
    if (!item.sizeInMegaBytes)
      return priority;

    const sizeInt = parseInt(config.size.match(/<\s*(\d+)\s*mb/i)?.[1] || "0", 10);
    if (sizeInt > 0 && parseInt(item.sizeInMegaBytes, 10) <= sizeInt)
      priority += 1;
  }

  return priority;
}


const getSeeders = (item: MediaInfo): number => {
  if (!item.title)
    return 0;
  const str_seeders = item.title.match(/👤\s*(\d+)/)?.[1] || "0";

  return parseInt(str_seeders, 10);
}

