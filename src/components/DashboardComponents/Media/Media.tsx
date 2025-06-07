"use client";
import React, { useState, useEffect } from "react";
import { FaUpload, FaPlay, FaSync } from "react-icons/fa";
import MediaDialog from "./addMediaDialog";
import ImagePopup from "./imagePopup";
import { MediaItem } from "@/interfaces/Media";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface MediaProps {
  media: MediaItem[];
  onRefresh: () => void;
  storageUsed: number;
  isLoading?: boolean;
}

export const Media = ({
  media,
  onRefresh,
  storageUsed,
  isLoading = false,
}: MediaProps) => {
  const [cols, setCols] = useState<number>(3);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const STORAGE_LIMIT_MB = 500; // 500MB total storage limit

  // const mediaItems: MediaItem[] = [
  //   {
  //     url: "https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FUJuPu4QGhf?alt=media&token=b6b69fdc-ba57-4e10-a9a1-e9caed2659b5",
  //     name: "Event Image 1",
  //     isVideo: true,
  //   },
  //   {
  //     url: "https://d11p0alxbet5ud.cloudfront.net/Pictures/1024x536/4/8/2/1417482_img_243663.jpg",
  //     name: "Event Image 2",
  //     isVideo: false,
  //   },
  //   {
  //     url: "https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FcnW2SrwMlL?alt=media&token=7bb4222f-16a8-4822-82d3-761ae6d29bb8",
  //     name: "Event Image 3",
  //     isVideo: false,
  //   },
  //   {
  //     url: "https://d11p0alxbet5ud.cloudfront.net/Pictures/1024x536/4/8/2/1417482_img_243663.jpg",
  //     name: "Event Image 4",
  //     isVideo: false,
  //   },
  //   {
  //     url: "https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FcnW2SrwMlL?alt=media&token=7bb4222f-16a8-4822-82d3-761ae6d29bb8",
  //     name: "Event Image 5",
  //     isVideo: false,
  //   },
  //   {
  //     url: "https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FeRL0cLWK0q?alt=media&token=92094ae8-ee14-4cdc-ad55-7ddd728c95b7",
  //     name: "Event Image 6",
  //     isVideo: false,
  //   },
  //   {
  //     url: "https://d11p0alxbet5ud.cloudfront.net/Pictures/1024x536/4/8/2/1417482_img_243663.jpg",
  //     name: "Event Image 7",
  //     isVideo: false,
  //   },
  // ];

  const getColumnMediaItems = (colIndex: number) => {
    return media.filter((_, index) => index % cols === colIndex);
  };

  useEffect(() => {
    const handleResize = () => {
      setCols(window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsPopupOpen(true);
  };

  const MediaThumbnail = ({
    item,
    onClick,
  }: {
    item: MediaItem;
    onClick: () => void;
  }) => {
    if (item.isVideo) {
      return (
        <div
          className="relative group mb-4 rounded-lg overflow-hidden cursor-pointer"
          onClick={onClick}
        >
          <div className="w-full h-fit media-section bg-gray-900 rounded-lg relative flex items-center justify-center overflow-hidden">
            <video
              className="w-full h-auto max-h-[40vh] lg:max-h-[60vh] md:min-h-[150px] min-h-[100px] object-cover"
              preload="metadata"
            >
              <source src={item.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
              <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <FaPlay size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative group mb-4 rounded-lg overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-fit max-h-[40vh] lg:max-h-[60vh] md:min-h-[150px] min-h-[100px] shadow-md transition-all duration-300 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    );
  };

  return (
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow">
      <div className="flex p-3 h-16 sticky top-0 z-10 bg-white justify-between items-center px-4 border-b border-stone-200">
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-xl">Media</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className={`h-8 w-8 ${isLoading ? "animate-spin" : ""}`}
                  >
                    <FaSync className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh media</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-stone-500">
              <span
                className={
                  storageUsed > STORAGE_LIMIT_MB * 0.9
                    ? "text-red-500 font-medium"
                    : ""
                }
              >
                {storageUsed.toFixed(1)}MB
              </span>
              {" / "}
              <span>{STORAGE_LIMIT_MB}MB used</span>
            </div>
            <MediaDialog
              storageUsed={storageUsed}
              storageLimit={STORAGE_LIMIT_MB}
              onUploadComplete={onRefresh}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
          <div className="text-stone-500">Loading media...</div>
        </div>
      ) : media.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
          <div className="text-stone-500">No media found</div>
        </div>
      ) : (
        <div
          className={`grid ${
            cols === 2
              ? "grid-cols-2"
              : cols === 3
              ? "grid-cols-3"
              : "grid-cols-4"
          } px-8 py-4 gap-4 h-full`}
        >
          {[...Array(cols)].map((_, colIndex) => (
            <div key={colIndex} className="w-full h-fit pb-16 rounded-lg">
              {getColumnMediaItems(colIndex).map((item, index) => {
                const globalIndex = index * cols + colIndex;
                return (
                  <MediaThumbnail
                    key={index}
                    item={item}
                    onClick={() => handleImageClick(globalIndex)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}

      <ImagePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        images={media}
        initialIndex={selectedImageIndex}
      />
    </div>
  );
};
