"use client";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Image from "next/image";

const ImagePopup = ({ isOpen, onClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when popup is open
      document.body.style.overflow = "hidden";
      // Reset loading state when changing images
      setIsLoading(true);
      // Reset index when popup opens
      setCurrentIndex(initialIndex);
    } else {
      // Restore scrolling when popup is closed
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialIndex]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handleNext = (e) => {
    e.stopPropagation();
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") handleNext(e);
    if (e.key === "ArrowLeft") handlePrevious(e);
  };



  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button 
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full z-10"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      {/* Image container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          </div>
        )}
        
        <Image
          src={currentImage.url}
          alt={currentImage.name || "Gallery image"}
          fill
          className="object-contain"
          onLoad={() => setIsLoading(false)}
          priority
        />
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full"
            onClick={handlePrevious}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full"
            onClick={handleNext}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      
      {/* Download button */}
      {/* <button 
        className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full flex items-center gap-2"
        onClick={handleDownload}
      >
        <Download size={20} />
        <span className="mr-1">Download</span>
      </button> */}
      
      {/* Image counter */}
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImagePopup;