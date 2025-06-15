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
        setChannelBriefs(briefs);
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
            className="group bg-white grid grid-cols-1 justify-items-center hover:bg-stone-50 transition-colors rounded-lg p-4 my-4 border border-stone-200 hover:border-stone-300"
          >
            <div className="flex justify-between flex-col w-full items-start">
              <div className="space-y-2 w-full">
                <div className="flex items-center w-full gap-3 justify-between">
                  <Link href={`/channels/${channel.id}`}>
                    <h3 className="font-bold text-xl hover:text-violet-700 transition-colors">
                      {channel.name}
                    </h3>
                  </Link>
                  <div className="text-sm bg-stone-100 px-2 rounded-md flex items-center gap-1 cursor-default group-hover:bg-stone-200 transition-colors">
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
                <p className="text-sm text-stone-600">{channel.description}</p>
                <div className="flex items-center gap-4 text-sm text-stone-500">
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
        <div className="text-center text-stone-500">
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
        <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
          <Sidebar />
          <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow">
            {/* Top Bar */}
            <div className="flex py-3 h-16 justify-between items-center sticky top-0 bg-white px-4 border-b border-stone-200 z-10">
              <h2 className="font-bold">Channels</h2>
              <button
                onClick={() => setCreateNewChannel(true)}
                className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded"
              >
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
