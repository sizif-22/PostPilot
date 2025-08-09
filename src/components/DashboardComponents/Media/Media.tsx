"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaPlay, FaSync, FaTrash, FaTimes } from "react-icons/fa";
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
import { deleteMedia } from "@/firebase/storage";
import { useChannel } from "@/context/ChannelContext";
import Image from "next/image";
interface MediaProps {
  media: MediaItem[];
  onRefresh: () => void;
  storageUsed: number;
  isLoading?: boolean;
}

// Move MediaThumbnail outside and memoize it properly with stable props
const MediaThumbnail = React.memo(
  ({
    item,
    onImageClick,
    isSelected,
    isSelectMode,
    globalIndex,
  }: {
    item: MediaItem;
    onImageClick: (index: number) => void;
    isSelected: boolean;
    isSelectMode: boolean;
    globalIndex: number;
  }) => {
    const handleClick = useCallback(() => {
      onImageClick(globalIndex);
    }, [onImageClick, globalIndex]);

    if (item.isVideo) {
      return (
        <div
          className={`relative group mb-4 rounded-lg overflow-hidden cursor-pointer ${
            isSelected ? "ring-2 ring-violet-500" : ""
          }`}
          onClick={handleClick}>
          <div className="w-full h-fit media-section bg-gray-900 dark:bg-darkBackground rounded-lg relative flex items-center justify-center overflow-hidden">
            <video
              className="w-full h-auto max-h-[40vh] lg:max-h-[60vh] md:min-h-[150px] min-h-[100px] object-cover"
              preload="metadata">
              <source src={item.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <FaPlay size={24} className="text-white" />
              </div>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`relative group mb-4 rounded-lg overflow-hidden cursor-pointer ${
          isSelected ? "ring-2 ring-violet-500" : ""
        }`}
        onClick={handleClick}>
        <Image
          src={item.url}
          alt={item.name}
          width={500}
          height={1080}
          className="w-full h-fit max-h-[40vh] lg:max-h-[60vh] md:min-h-[150px] min-h-[100px] shadow-md transition-all duration-300 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
        )}
      </div>
    );
  }
);

MediaThumbnail.displayName = "MediaThumbnail";

export const Media = ({
  media,
  onRefresh,
  storageUsed,
  isLoading = false,
}: MediaProps) => {
  const [cols, setCols] = useState<number>(3);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const STORAGE_LIMIT_MB = 500; // 500MB total storage limit
  const { channel } = useChannel();
  const getColumnMediaItems = useMemo(
    () => (colIndex: number) => {
      return media.filter((_, index) => index % cols === colIndex);
    },
    [media, cols]
  );

  useEffect(() => {
    const handleResize = () => {
      setCols(window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize the click handler to prevent re-renders
  const handleImageClick = useCallback(
    (index: number) => {
      if (isSelectMode) {
        const item = media[index];
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(item.url)) {
            newSet.delete(item.url);
          } else {
            newSet.add(item.url);
          }
          return newSet;
        });
      } else {
        setSelectedImageIndex(index);
        setIsPopupOpen(true);
      }
    },
    [isSelectMode, media]
  );

  const handleDeleteSelected = async () => {
    try {
      const selectedMedia = media.filter((item) => selectedItems.has(item.url));
      await Promise.all(selectedMedia.map((item) => deleteMedia(item.url)));
      setSelectedItems(new Set());
      setIsSelectMode(false);
      onRefresh();
    } catch (error) {
      console.error("Error deleting media:", error);
      // You might want to show an error toast here
    }
  };

  const handleCancelSelection = () => {
    setSelectedItems(new Set());
    setIsSelectMode(false);
  };

  return (
    <div className="bg-white dark:bg-secondDarkBackground dark:to-[#2a2a2a] h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] border border-stone-200 dark:border-darkBorder transition-colors duration-300">
      <div className="flex p-3 h-16 sticky top-0 z-10 bg-white dark:bg-secondDarkBackground justify-between items-center px-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-xl dark:text-white">Media</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className={`h-8 w-8 ${isLoading ? "animate-spin" : ""} dark:bg-stone-900 dark:text-white dark:border-stone-800 dark:hover:bg-stone-800`}>
                    <FaSync className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh media</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {(channel?.authority == "Owner" ||
            channel?.authority == "Contributor") && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-stone-500 dark:text-stone-400">
                <span
                  className={
                    storageUsed > STORAGE_LIMIT_MB * 0.9
                      ? "text-red-500 font-medium"
                      : ""
                  }>
                  {storageUsed.toFixed(1)}MB
                </span>
                {" / "}
                <span>{STORAGE_LIMIT_MB}MB used</span>
              </div>
              {!isSelectMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsSelectMode(true)}
                    className="h-8 dark:bg-stone-900 dark:text-white dark:border-stone-800 dark:hover:bg-stone-800">
                    Select
                  </Button>
                  <MediaDialog
                    storageUsed={storageUsed}
                    storageLimit={STORAGE_LIMIT_MB}
                    onUploadComplete={onRefresh}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={selectedItems.size === 0}
                    className="h-8 dark:bg-red-700 dark:hover:bg-red-800">
                    <FaTrash className="h-4 w-4 mr-2" />
                    Delete ({selectedItems.size})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelSelection}
                    className="h-8 dark:bg-stone-900 dark:text-white dark:border-stone-800 dark:hover:bg-stone-800">
                    <FaTimes className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
          <div className="text-stone-500 dark:text-gray-400">Loading media...</div>
        </div>
      ) : media.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
          <div className="text-stone-500 dark:text-gray-400">No media found</div>
        </div>
      ) : (
        <div
          className={`grid ${
            cols === 2
              ? "grid-cols-2"
              : cols === 3
              ? "grid-cols-3"
              : "grid-cols-4"
          } px-8 py-4 gap-4 h-full`}>
          {[...Array(cols)].map((_, colIndex) => (
            <div key={colIndex} className="w-full h-fit pb-16 rounded-lg">
              {getColumnMediaItems(colIndex).map((item, index) => {
                const globalIndex = index * cols + colIndex;
                return (
                  <MediaThumbnail
                    key={item.url}
                    item={item}
                    onImageClick={handleImageClick}
                    isSelected={selectedItems.has(item.url)}
                    isSelectMode={isSelectMode}
                    globalIndex={globalIndex}
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
