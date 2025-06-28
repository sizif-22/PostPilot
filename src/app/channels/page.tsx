"use client";
import { Sidebar } from "@/components/ChannelComponents/Sidebar";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { getChannelBriefs } from "@/firebase/channel.firestore";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import Loading from "@/components/ui/Loading";
import { NewChannel } from "@/components/ChannelComponents/newChannel";
import { ChannelBrief } from "@/interfaces/Channel";
import { UserChannel } from "@/interfaces/User";
const ChannelsComponent = ({
  channels,
}: {
  channels: UserChannel[];
}): JSX.Element => {
  const [channelBriefs, setChannelBriefs] = useState<ChannelBrief[]>([]);
  useEffect(() => {
    const fetchChannels = async () => {
      if (channels.length > 0) {
        const briefs = await getChannelBriefs(channels);
        const sortedBriefs = Object.values(briefs).sort((a, b) => {
          const dateA = a.createdAt.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt.seconds * 1000);
          const dateB = b.createdAt.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt.seconds * 1000);
          return dateB.getTime() - dateA.getTime();
        });
        setChannelBriefs(sortedBriefs);
      }
    };
    fetchChannels();
  }, [channels]);
  return (
    <>
      {channelBriefs.length > 0 ? (
        channelBriefs.map((channel: ChannelBrief) => (
          <div
            key={channel.name}
            className="group bg-white dark:bg-darkButtons grid grid-cols-1 justify-items-center hover:bg-stone-50 dark:hover:bg-darkBorder transition-colors rounded-lg p-4 my-4 border border-stone-200 dark:border-darkBorder hover:border-stone-300 dark:hover:border-stone-600">
            <div className="flex justify-between flex-col w-full items-start">
              <div className="space-y-2 w-full">
                <div className="flex items-center w-full gap-3 justify-between">
                  <Link href={`/channels/${channel.id}`}>
                    <h3 className="font-bold text-xl hover:text-violet-700 dark:text-white dark:hover:text-violet-400 transition-colors">
                      {channel.name}
                    </h3>
                  </Link>
                  <div className="text-sm bg-stone-100 dark:bg-darkBorder px-2 rounded-md dark:text-white flex items-center gap-1 cursor-default group-hover:bg-stone-200 dark:group-hover:bg-darkBorder dark:group-hover:shadow  transition-colors">
                    {channel.authority === "Owner" ? (
                      <span className="text-lg pb-1">👑</span>
                    ) : channel.authority === "Reviewer" ? (
                      <span className="text-lg pb-1">🔍</span>
                    ) : (
                      <span className="text-lg pb-1">✒️</span>
                    )}
                    {channel.authority}
                  </div>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400">{channel.description}</p>
                <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-500">
                  <span>•</span>
                  <span>
                    CreatedAt: {channel.createdAt.toDate().toUTCString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-stone-500 dark:text-stone-400">
          <p>No channels found</p>
        </div>
      )}
    </>
  );
};

const Page = () => {
  const { user } = useUser();
  const [createNewChannel, setCreateNewChannel] = useState(false);

  if (!user?.channels) {
    return <Loading />;
  }
  return (
    <>
      {createNewChannel ? (
        <NewChannel setCreateNewChannel={setCreateNewChannel} />
      ) : (
        <main className="grid gap-4 p-4 grid-cols-[220px,_1fr] dark:bg-darkBackground">
          <Sidebar />
          <div className="bg-white dark:bg-secondDarkBackground border dark:border-darkBorder h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
            {/* Top Bar */}
            <div className="flex py-3 h-16 justify-between items-center sticky top-0 bg-white dark:bg-secondDarkBackground px-4 border-b border-stone-200 dark:border-darkBorder z-10">
              <h2 className="font-bold dark:text-white">Channels</h2>
              <button
                onClick={() => setCreateNewChannel(true)}
                className="flex text-sm items-center gap-2 bg-stone-100 dark:bg-darkButtons dark:text-white transition-colors hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900 dark:hover:text-violet-300 px-3 py-1.5 rounded">
                <FiPlus className="text-violet-500" />
                <span>New Channel</span>
              </button>
            </div>

            {/* Channels */}
            <div className="px-16 py-4">
              <ChannelsComponent channels={user.channels} />
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default Page;
