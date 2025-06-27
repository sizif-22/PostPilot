"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Info,
} from "lucide-react";
import { MediaEvent, ImagePopupProps } from "@/interfaces/Media";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaPlay } from "react-icons/fa";

const ImagePopup = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImagePopupProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setIsZoomed(false);
      setShowInfo(false);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialIndex]);

  if (!isOpen || !images || images.length === 0) return null;

  const mediaItems = images;
  const currentItem = mediaItems[currentIndex];

  if (!currentItem) return null;

  const handlePrevious = (e?: MediaEvent) => {
    if (e) e.stopPropagation();
    setIsLoading(true);
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = (e?: MediaEvent) => {
    if (e) e.stopPropagation();
    setIsLoading(true);
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      handlePrevious(e);
    } else if (e.key === "ArrowRight") {
      handleNext(e);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(currentItem.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentItem.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentItem.name,
          url: currentItem.url,
        });
      } else {
        await navigator.clipboard.writeText(currentItem.url);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={onClose}>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white flex items-center gap-4">
              <h3 className="text-lg font-medium">{currentItem.name}</h3>
              <span className="text-sm text-white/70">
                {currentIndex + 1} / {mediaItems.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(!showInfo);
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      <Info size={20} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-gray-800 dark:text-white">
                    <p>Toggle Info</p>
                  </TooltipContent>
                </Tooltip>

                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Download size={20} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download</p>
                  </TooltipContent>
                </Tooltip> */}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      <Share2 size={20} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-gray-800 dark:text-white">
                    <p>Share</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed(!isZoomed);
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      {isZoomed ? (
                        <ZoomOut size={20} className="text-white" />
                      ) : (
                        <ZoomIn size={20} className="text-white" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-gray-800 dark:text-white">
                    <p>{isZoomed ? "Zoom Out" : "Zoom In"}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      <X size={20} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-gray-800 dark:text-white">
                    <p>Close</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Navigation Buttons */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors group"
            disabled={mediaItems.length <= 1}>
            <ChevronLeft
              size={24}
              className="text-white transition-transform group-hover:-translate-x-1"
            />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors group"
            disabled={mediaItems.length <= 1}>
            <ChevronRight
              size={24}
              className="text-white transition-transform group-hover:translate-x-1"
            />
          </motion.button>

          {/* Main Content */}
          <motion.div
            className="max-w-7xl mx-auto px-4 select-none"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}>
            {!currentItem.isVideo ? (
              <div className="relative group">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
                <motion.div
                  initial={false}
                  animate={{ scale: isZoomed ? 1.5 : 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(!isZoomed);
                  }}>
                  <Image
                    src={currentItem.url}
                    alt={currentItem.name}
                    width={1200}
                    height={800}
                    className={`max-w-full max-h-[80vh] object-contain mx-auto rounded-lg ${
                      isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                    }`}
                    onLoad={() => setIsLoading(false)}
                    priority
                    quality={100}
                  />
                </motion.div>
              </div>
            ) : (
              <video
                src={currentItem.url}
                controls
                className="max-h-[80vh] object-contain mx-auto rounded-lg"
                autoPlay
                onLoadStart={() => setIsLoading(false)}>
                Your browser does not support the video tag.
              </video>
            )}
          </motion.div>

          {/* Info Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-24 right-4 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-4 text-white">
                <h4 className="font-medium mb-2">{currentItem.name}</h4>
                <p className="text-sm text-white/70">
                  Type:{" "}
                  {currentItem.type ||
                    (currentItem.isVideo ? "Video" : "Image")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thumbnails */}
          <AnimatePresence>
            {showThumbnails && mediaItems.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-lg">
                  {mediaItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={{
                        scale: index === currentIndex ? 1.1 : 1,
                        opacity: index === currentIndex ? 1 : 0.6,
                      }}
                      className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer transition-all ${
                        index === currentIndex
                          ? "ring-2 ring-white"
                          : "hover:opacity-80"
                      }`}
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsLoading(true);
                        setIsZoomed(false);
                      }}>
                      {item.isVideo ? (
                        <div className="relative w-full h-full">
                          <video
                            className="w-full h-full object-cover"
                            preload="metadata">
                            <source src={item.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-md">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center">
                              <FaPlay size={12} className="text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={item.url}
                          alt={`Thumbnail ${index}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePopup;
