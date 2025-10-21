"use client";
import { useChannel } from "@/context/ChannelContext";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
// import { updateDoc, doc, arrayRemove } from "firebase/firestore";
// import { db } from "@/firebase/config";
// import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export const Platforms = () => {
  const { channel } = useChannel();

  const hasPlatforms =
    channel?.socialMedia?.facebook ||
    channel?.socialMedia?.instagram ||
    channel?.socialMedia?.tiktok ||
    channel?.socialMedia?.linkedin ||
    channel?.socialMedia?.x ||
    channel?.socialMedia?.youtube;

  // const platforms = [
  //   {
  //     platform:"facebook",
  //     id: "",
  //     like: "",
  //     name: "",
  //   },
  //   {
  //     platform:"instagram",
  //     id: "",
  //     like: "",
  //     name: "",
  //   },
  //   {
  //     platform:"x",
  //     id: "",
  //     like: "",
  //     name: "",
  //   },
  //   {
  //     platform:"linkedin",
  //     id: "",
  //     like: "",
  //     name: "",
  //   },
  //   {
  //     platform:"tiktok",
  //     id: "",
  //     like: "",
  //     name: "",
  //   },
  // ];
  return (
    <Accordion
      type="single"
      className="dark:text-white"
      defaultValue="item-1"
      collapsible
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <h3 className="text-lg font-semibold dark:text-white">
            Connected Platforms
          </h3>
        </AccordionTrigger>
        <AccordionContent>
          <div className="overflow-auto ">
            {!hasPlatforms ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You did not add any platforms yet.
              </p>
            ) : (
              <div className="space-y-4">
                {channel?.socialMedia?.facebook &&
                  channel?.socialMedia?.facebook.id && (
                    <Link
                      href={`https://facebook.com/profile.php?id=${channel.socialMedia.facebook.id}`}
                      target="_blank"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200"
                    >
                      <FaFacebook className="text-blue-600 text-xl" />
                      <div>
                        <p className="font-medium dark:text-gray-100">
                          {channel.socialMedia.facebook.name}
                        </p>
                      </div>
                    </Link>
                  )}
                {channel?.socialMedia?.youtube && (
                  <Link
                    href={
                      channel.socialMedia.youtube.channelUrl ||
                      `https://www.youtube.com/channel/${channel.socialMedia.youtube.id}`
                    }
                    target="_blank"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200"
                  >
                    <FaYoutube className="text-red-600 text-xl" />
                    <div>
                      <p className="font-medium dark:text-gray-100">
                        {channel.socialMedia.youtube.name || "YouTube Channel"}
                      </p>
                    </div>
                  </Link>
                )}
                {channel?.socialMedia?.["instagram"] &&
                  channel.socialMedia.instagram.instagramUsername && (
                    <Link
                      href={`https://instagram.com/${channel.socialMedia.instagram.instagramUsername}`}
                      target="_blank"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200"
                    >
                      <FaInstagram className="text-pink-600 text-xl" />
                      <div>
                        <p className="font-medium dark:text-gray-100">
                          {channel.socialMedia.instagram.instagramName}
                        </p>
                      </div>
                    </Link>
                  )}
                {channel?.socialMedia?.tiktok && (
                  <Link
                    href={`https://tiktok.com/@${channel.socialMedia.tiktok.username}`}
                    target="_blank"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200"
                  >
                    <FaTiktok className="text-black dark:text-white text-xl" />
                    <div>
                      <p className="font-medium dark:text-gray-100">
                        {channel.socialMedia.tiktok.name || "TikTok User"}
                      </p>
                    </div>
                  </Link>
                )}
                {channel?.socialMedia?.x && (
                  <Link
                    href={`https://x.com/${channel.socialMedia.x.username}`}
                    target="_blank"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200"
                  >
                    <FaXTwitter className="dark:text-white text-xl" />
                    <div>
                      <p className="font-medium dark:text-gray-100">
                        {channel.socialMedia.x.name}
                      </p>
                    </div>
                  </Link>
                )}
                {channel?.socialMedia?.linkedin && (
                  <Link
                    href={channel.socialMedia.linkedin.url}
                    target="_blank"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200"
                  >
                    <FaLinkedin className="text-blue-700 text-xl" />
                    <div>
                      <p className="font-medium dark:text-gray-100">
                        {channel.socialMedia.linkedin.name}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
