"use client";
import { useChannel } from "@/context/ChannelContext";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { updateDoc, doc, arrayRemove } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useEffect } from "react";
export const Platforms = () => {
  const { channel } = useChannel();

  const hasPlatforms =
    channel?.socialMedia?.facebook ||
    channel?.socialMedia?.instagram ||
    channel?.socialMedia?.tiktok ||
    channel?.socialMedia?.linkedin ||
    channel?.socialMedia?.x;
  return (
    <div className="col-span-1 row-span-2 border shadow-sm dark:shadow-lg rounded-lg p-4 h-[50vh] dark:bg-transparent dark:border-darkBorder">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">
        Connected Platforms
      </h3>
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
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200">
                <FaFacebook className="text-blue-600 text-xl" />
                <div>
                  <p className="font-medium dark:text-gray-100">
                    {channel.socialMedia.facebook.name}
                  </p>
                </div>
              </Link>
            )}
          {channel?.socialMedia?.instagram &&
            channel.socialMedia.instagram.instagramUsername && (
              <Link
                href={`https://instagram.com/${channel.socialMedia.instagram.instagramUsername}`}
                target="_blank"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200">
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
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200">
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
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg cursor-pointer hover:dark:bg-darkBorder transition-all hover:bg-gray-200">
              <FaXTwitter className="dark:text-white text-xl" />
              <div>
                <p className="font-medium dark:text-gray-100">
                  {channel.socialMedia.x.name}
                </p>
              </div>
            </Link>
          )}
          {channel?.socialMedia?.linkedin && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-darkButtons rounded-lg">
              <FaLinkedin className="text-blue-700 text-xl" />
              <div>
                <p className="font-medium dark:text-gray-100">
                  {channel.socialMedia.linkedin.name}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
