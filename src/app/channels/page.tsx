import { Sidebar } from "@/components/Channel/Sidebar";
import Link from "next/link";
import { FiMoreVertical, FiPlus } from "react-icons/fi";
const Page = () => {
  const Channels = [
    {
      name: "project1",
      description: "This is a description",
      updatedAt: "2021-01-01",
    },
    {
      name: "project2",
      description: "This is a description",
      updatedAt: "2021-01-01",
    },
    {
      name: "project3",
      description: "This is a description",
      updatedAt: "2021-01-01",
    },
    {
      name: "project4",
      description: "This is a description",
      updatedAt: "2021-01-01",
    },
    {
      name: "project5",
      description: "This is a description",
      updatedAt: "2021-01-01",
    },
    {
      name: "project6",
      description: "This is a description",
      updatedAt: "2021-01-01",
    },
    {
      name: "project7",
      description: "This is a description",
      updatedAt: "2021-01-01",
    },
  ];
  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow">
        {/* Top Bar */}
        <div className="flex py-3 h-16 justify-between items-center sticky top-0 bg-white px-4 border-b border-stone-200 z-10">
          <h2 className="font-bold">Channels</h2>
          <button className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded">
            <FiPlus className="text-violet-500" />
            <span>New Channel</span>
          </button>
        </div>

        {/* Channels */}
        <div className="px-16 py-4">
          {Channels.map((channel) => (
            <div
              key={channel.name}
              className="group relative bg-white hover:bg-stone-50 transition-colors rounded-lg p-4 my-4 border border-stone-200 hover:border-stone-300"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/channels/${channel.name}`}>
                      <h3 className="font-bold text-xl hover:text-violet-700 transition-colors">
                        {channel.name}
                      </h3>
                    </Link>
                  </div>
                  <p className="text-sm text-stone-600">
                    {channel.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span>•</span>
                    <span>Updated {channel.updatedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Page;
