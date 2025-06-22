import React from "react";
import { Command } from "cmdk";
import {
  FiX,
  FiMoreHorizontal,
  FiFacebook,
  FiInstagram,
  FiGlobe,
  FiClock,
} from "react-icons/fi";
import { FaPlay } from "react-icons/fa";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
const timeZones = Intl.supportedValuesOf("timeZone");
import { formatDateInTimezone } from "@/lib/utils";

export const DetailsDialog = ({
  selectedEvent,
  setSelectedEvent,
  open,
  setOpen,
}: {
  selectedEvent: Post | null;
  setSelectedEvent: (event: Post | null) => void;
  open: boolean;
  setOpen: any;
}) => {
  const { channel } = useChannel();
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <FiFacebook className="text-[#1877F2]" />;
      case "instagram":
        return <FiInstagram className="text-[#E4405F]" />;
      default:
        return <FiGlobe className="text-stone-600" />;
    }
  };

  return (
    selectedEvent && (
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Post Details"
        className="fixed inset-0 bg-stone-950/50 flex items-center justify-center z-50"
        onClick={() => setOpen(false)}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg w-full max-h-[99vh] max-w-xl mx-4 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 flex items-center justify-between  border-b border-stone-200 h-[9vh]">
            <div className="flex sticky top-0 justify-between w-full items-center">
              <h3 className="text-lg font-semibold">Scheduled Post Preview</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="hover:bg-stone-100 p-1 rounded-full transition-colors">
                <FiX className="text-stone-500" />
              </button>
            </div>
          </div>

          {/* Post Preview */}
          <div className="p-4 overflow-y-auto max-h-[80vh]">
            <div className="bg-stone-50  rounded-lg p-4 space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-600 font-semibold">
                      {channel?.socialMedia?.facebook.name.slice(0, 1)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {channel?.socialMedia?.facebook.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <div className="flex items-center gap-1">
                        <FiClock className="text-stone-400" />
                        {selectedEvent.scheduledDate &&
                          formatDateInTimezone(
                            selectedEvent.scheduledDate,
                            "Africa/Cairo"
                          ).time}{" "}
                        at {/* {format(selectedEvent.date, "p")} */}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {selectedEvent?.platforms?.map((platform, index) => (
                          <span key={platform} className="flex items-center">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-1 hover:bg-stone-200 rounded-full transition-colors">
                  <FiMoreHorizontal className="text-stone-500" />
                </button>
              </div>

              {/* Post Content */}
              <div className="space-y-3">
                <p className="text-[15px] whitespace-pre-wrap">
                  {selectedEvent.content || selectedEvent.message}
                </p>
                {selectedEvent.imageUrls && (
                  <div
                    className={`rounded-lg overflow-hidden border border-stone-200 grid gap-1 ${
                      selectedEvent.imageUrls.length === 1
                        ? "grid-cols-1"
                        : "grid-cols-2"
                    }`}>
                    {selectedEvent.imageUrls.slice(0, 3).map((image, index) => {
                      const isLastImage =
                        index === 2 && selectedEvent.imageUrls!.length > 3;
                      const remainingCount =
                        selectedEvent.imageUrls!.length - 3;

                      return (
                        <div
                          key={index}
                          className={`relative ${
                            selectedEvent.imageUrls!.length >= 3 && index === 0
                              ? "row-span-2"
                              : ""
                          }`}>
                          {image.isVideo ? (
                            <>
                              <video
                                className="w-full h-full object-cover"
                                preload="metadata">
                                <source src={image.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                  <FaPlay size={24} className="text-white" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <img
                              src={image.url}
                              alt={`Post image ${index + 1}`}
                              className={`w-full h-full object-cover ${
                                isLastImage ? "brightness-50 blur-[2px]" : ""
                              }`}
                              style={{ minHeight: "200px" }}
                            />
                          )}

                          {isLastImage && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-3xl font-bold">
                                +{remainingCount}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Post Status */}
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  <span className="font-medium">Scheduled</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-stone-500">
                    Will be posted on{" "}
                    {selectedEvent.scheduledDate &&
                      selectedEvent.clientTimeZone &&
                      formatDateInTimezone(
                        selectedEvent.scheduledDate,
                        selectedEvent.clientTimeZone
                      ).date}{" "}
                    {selectedEvent.scheduledDate &&
                      selectedEvent.clientTimeZone &&
                      formatDateInTimezone(
                        selectedEvent.scheduledDate,
                        selectedEvent.clientTimeZone
                      ).month}{" "}
                    at{" "}
                    {selectedEvent.scheduledDate &&
                      selectedEvent.clientTimeZone &&
                      formatDateInTimezone(
                        selectedEvent.scheduledDate,
                        selectedEvent.clientTimeZone
                      ).time}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {(channel?.authority == "Owner" ||
            channel?.authority == "Contributor") && (
            <div className="px-4 flex items-center w-full border-t border-stone-200 bg-stone-50 h-[9vh]">
              <div className="flex justify-end gap-2 w-full">
                <button
                  onClick={() => {
                    fetch(`/api/facebook/deletepost`, {
                      headers: {
                        "Content-Type": "application/json",
                      },
                      method: "DELETE",
                      body: JSON.stringify({
                        postId: selectedEvent.id,
                        channelId: channel?.id as string,
                      }),
                    });
                    setOpen(false);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                  Delete Post
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors"
                  onClick={() => {
                    fetch(`/api/facebook/editpost`, {
                      headers: {
                        "Content-Type": "application/json",
                      },
                      method: "PUT",
                      body: JSON.stringify({
                        postId: selectedEvent.id,
                        channelId: channel?.id as string,
                        post: selectedEvent,
                      }),
                    });
                    setOpen(false);
                    setSelectedEvent(null);
                  }}>
                  Edit Post
                </button>
              </div>
            </div>
          )}
        </div>
      </Command.Dialog>
    )
  );
};
