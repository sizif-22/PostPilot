"use client";
import { useChannel } from "@/context/ChannelContext";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export const Platforms = () => {
  const { channel } = useChannel();

  const hasPlatforms =
    channel?.socialMedia?.facebook || channel?.socialMedia?.instagram;

  return (
    <div className="col-span-1 row-span-2 border shadow-sm rounded-lg p-4 h-[50vh]">
      <h3 className="text-lg font-semibold mb-4">Connected Platforms</h3>
      {!hasPlatforms ? (
        <p className="text-sm text-gray-500">
          You did not add any platforms yet.
        </p>
      ) : (
        <div className="space-y-4">
          {channel?.socialMedia?.facebook && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaFacebook className="text-blue-600 text-xl" />
              <div>
                <p className="font-medium">
                  {channel.socialMedia.facebook.name}
                </p>
                <p className="text-sm text-gray-500">Facebook Page</p>
              </div>
            </div>
          )}
          {channel?.socialMedia?.instagram && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaInstagram className="text-pink-600 text-xl" />
              <div>
                <p className="font-medium">
                  {channel.socialMedia.instagram.pageName}
                </p>
                <p className="text-sm text-gray-500">Instagram Account</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
