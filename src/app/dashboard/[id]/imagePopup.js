"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ImagePopup = ({ isOpen, onClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  // Reset to initial index when the popup opens or when initial index changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoading(true);
      // Prevent scrolling when popup is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling when popup is closed
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialIndex]);

  if (!isOpen || !images || images.length === 0) return null;

  const mediaItems = images || [];
  const currentItem = mediaItems[currentIndex];

  if (!currentItem) {
    return null;
  }

  const handlePrevious = (e) => {
    if (e) e.stopPropagation();
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
        >
          <X size={24} />
        </button>
      </div>

      <div
        className="absolute top-1/2 left-4 transform -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          disabled={mediaItems.length <= 1}
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div
        className="absolute top-1/2 right-4 transform -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleNext}
          className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          disabled={mediaItems.length <= 1}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div
        className="max-w-4xl h-screen pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Use isVideo flag instead of trying to determine from URL */}
        {!currentItem.isVideo ? (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            <Image
              src={currentItem.url}
              alt={currentItem.name || "Image"}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain mx-auto"
              onLoad={() => setIsLoading(false)}
              priority
            />
          </div>
        ) : (
          <video
            src={currentItem.url}
            controls
            className="max-h-[50vh] object-contain mx-auto"
            autoPlay
            onLoadStart={() => setIsLoading(false)}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
        {currentIndex + 1} / {mediaItems.length}
      </div>

      {/* Thumbnail gallery */}
      {mediaItems.length > 1 && (
        <div
          className="absolute bottom-12 left-0 right-0 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex space-x-2 overflow-x-auto p-2 bg-black bg-opacity-50 rounded-lg max-w-[80vw]">
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className={`w-16 h-16 cursor-pointer rounded overflow-hidden border-2 ${
                  index === currentIndex
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
              >
                {item.isVideo ? (
                  <div className="h-[50vh] bg-gray-800 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePopup;
