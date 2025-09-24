import { Upcoming } from "./Upcoming";
import { Storage } from "./Storage";
import { Platforms } from "./Platforms";
import { useChannel } from "@/context/ChannelContext";
import { MediaItem } from "@/interfaces/Media";
export const Grid = ({
  storageLimit,
  storageUsed,
  filesCount,
  media,
}: {
  storageLimit: number;
  storageUsed: number;
  filesCount: number;
  media: MediaItem[];
}) => {
  const { channel } = useChannel();
  return (
    <>
      <div className="px-4 lg:grid gap-y-[1vh] gap-x-3 grid-cols-1 lg:grid-cols-3 pb-5">
        <Upcoming media={media} />
        <div className="flex flex-col gap-2 h-full">
        <Platforms />
        {(channel?.authority == "Owner" ||
          channel?.authority == "Contributor") && (
            <Storage
            storageLimit={storageLimit}
            storageUsed={storageUsed}
            filesCount={filesCount}
            />
          )}
          </div>
      </div>
    </>
  );
};
