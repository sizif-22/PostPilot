"use client";
import { useState, useEffect, useRef } from "react";
import { uploadImage } from "@/app/Firebase/firebase.storage";
import {
  Plus,
  Play,
  CheckSquare,
  Square,
  AlertCircle,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ImagePopup from "./ImagePopup";

const validateFileType = (file) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/heif",
    "image/webp",
  ];

  const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
  ];

  // Check if file is an allowed image or video
  if (
    !allowedImageTypes.includes(file.type) &&
    !allowedVideoTypes.includes(file.type)
  ) {
    return false;
  }

  return true;
};

// Helper function to check if file is a video
const isVideoFile = (file) => {
  // If it's a media object with contentType or isVideo flag
  if (file && typeof file === "object") {
    // First check for isVideo flag that comes from Firebase metadata
    if (file.isVideo !== undefined) {
      return file.isVideo;
    }

    // Then check contentType if available
    if (file.contentType) {
      return file.contentType.startsWith("video/");
    }

    // For File objects (during upload)
    if (file.type) {
      const videoTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
      ];
      return videoTypes.includes(file.type);
    }
  }

  // Fallback for string URLs - check for video content type indicators
  if (typeof file === "string") {
    // If it's a Firebase Storage URL with a token
    if (file.includes("?alt=media")) {
      return file.includes("video/") || file.includes("content_type=video");
    }

    // Traditional extension checking
    const extension = file.split(".").pop().split("?")[0].toLowerCase();
    return ["mp4", "webm", "ogg", "mov", "avi"].includes(extension);
  }

  return false;
};

const STORAGE_LIMIT_MB = 500; // 500MB total storage limit

const MediaSection = ({ id, imgs, isChanged, setIsChanged, storageUsed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const inputRef = useRef(null);
  // State for the image popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupImageIndex, setPopupImageIndex] = useState(0);
  // State for video preview
  const [videoPreview, setVideoPreview] = useState(null);

  // Calculate columns based on screen width
  const getColumns = (width) => {
    if (width < 640) return 2;
    if (width < 768) return 3;
    return 4;
  };

  const [numOfColumns, setNumOfColumns] = useState(
    typeof window !== "undefined" ? getColumns(window.innerWidth) : 4
  );

  useEffect(() => {
    const handleResize = () => {
      const newColumns = getColumns(window.innerWidth);
      setNumOfColumns(newColumns);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNewMedia = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => validateFileType(file));

    if (validFiles.length > 0) {
      // Check if adding these files would exceed storage limit
      const newFilesSize =
        validFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
      if (storageUsed + newFilesSize > STORAGE_LIMIT_MB) {
        alert(
          `Adding these files would exceed your storage limit of ${STORAGE_LIMIT_MB}MB.`
        );
        return;
      }

      setSelectedMedia((prev) => [...prev, ...validFiles]);
    }
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      // Upload all media concurrently
      await Promise.all(
        selectedMedia.map(async (media) => {
          const result = await uploadImage({
            dir: id.toString(),
            file: media,
          });

          if (!result) {
            throw new Error(`Failed to upload ${media.name}`);
          }
          return result;
        })
      );

      // Update the imgs state with the new uploads
      setIsChanged(!isChanged);

      // Clear selection after successful upload
      setSelectedMedia([]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedForDelete([]);
    // Close video preview if open
    if (videoPreview) {
      setVideoPreview(null);
    }
  };

  const toggleSelectImage = (imagePath) => {
    if (selectedForDelete.includes(imagePath)) {
      setSelectedForDelete(
        selectedForDelete.filter((path) => path !== imagePath)
      );
    } else {
      setSelectedForDelete([...selectedForDelete, imagePath]);
    }
  };

  const selectAllImages = () => {
    if (selectedForDelete.length === imgs.length) {
      // If all are selected, deselect all
      setSelectedForDelete([]);
    } else {
      // Otherwise, select all
      setSelectedForDelete(imgs.map((img) => img.path));
    }
  };

  const deleteSelectedImages = async () => {
    if (selectedForDelete.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedForDelete.length} item(s)?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const { ref, deleteObject } = await import("firebase/storage");
      const { storage } = await import("@/app/Firebase/firebase.config");

      await Promise.all(
        selectedForDelete.map(async (path) => {
          const mediaRef = ref(storage, path);
          try {
            await deleteObject(mediaRef);
          } catch (error) {
            console.error(`Error deleting item ${path}:`, error);
          }
        })
      );

      // Reset selection state
      setSelectedForDelete([]);
      setSelectMode(false);

      // Refresh images
      setIsChanged(!isChanged);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to handle media click
  const handleMediaClick = (index, item) => {
    if (!selectMode) {
      if (isVideoFile(item)) {
        // For videos, open video preview
        setVideoPreview(item);
      } else {
        // For images, open image popup - get proper index for images only
        const imagesList = imgs.filter((img) => !isVideoFile(img));
        const actualImageIndex = imagesList.findIndex(
          (img) => img.path === item.path
        );
        if (actualImageIndex >= 0) {
          setPopupImageIndex(actualImageIndex);
          setPopupOpen(true);
        }
      }
    }
  };

  // Function to process media items with proper indexing
  const processMediaItems = () => {
    // Create two separate arrays
    const images = [];
    const videos = [];

    imgs.forEach((item, index) => {
      const isVideo = isVideoFile(item);
      const mediaItem = {
        ...item,
        index,
        isVideo,
      };

      if (isVideo) {
        videos.push(mediaItem);
      } else {
        images.push(mediaItem);
      }
    });

    return { images, videos, allMedia: [...videos, ...images] };
  };

  // Function to distribute media across columns for masonry layout
  const getMediaColumns = () => {
    const columns = Array(numOfColumns)
      .fill()
      .map(() => []);

    // First column always has the upload button
    columns[0].unshift({
      type: "upload",
      key: "upload-button",
    });

    // Get processed media items
    const { allMedia } = processMediaItems();

    // Distribute all media across columns
    allMedia.forEach((item) => {
      // Find the shortest column
      const shortestColumnIndex = columns
        .map((col, i) => ({ index: i, height: col.length }))
        .reduce((min, col) => (col.height < min.height ? col : min), {
          index: 0,
          height: Infinity,
        }).index;

      columns[shortestColumnIndex].push({
        type: "media",
        ...item,
        key: `media-${item.index}`,
      });
    });

    return columns;
  };

  const mediaColumns = getMediaColumns();
  const { images } = processMediaItems();

  // Calculate storage percentage
  const storagePercentage = (storageUsed / STORAGE_LIMIT_MB) * 100;
  const isStorageNearLimit = storagePercentage >= 80;

  // Close video preview
  const closeVideoPreview = () => {
    setVideoPreview(null);
  };

  return (
    <div className="h-[90vh]  grid grid-cols-5 px-5">
      <div className="py-20">
        {/* Storage limit display */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">
              Storage: {storageUsed.toFixed(2)}/{STORAGE_LIMIT_MB}MB
            </span>
            {isStorageNearLimit && (
              <div className="flex items-center text-red-500 text-sm">
                <AlertCircle size={16} className="mr-1" />
                Storage almost full
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div className="w-full md:w-1/5 bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                isStorageNearLimit ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Selection controls */}
        <div className="py-2 flex flex-wrap items-center">
          <div className="flex flex-wrap justify-between gap-3 w-fit">
            <Button
              variant={selectMode ? "default" : "outline"}
              size="sm"
              onClick={toggleSelectMode}
              className={`text-sm text-black ${selectMode && "text-white"}`}
            >
              {selectMode ? "Cancel Selection" : "Select Media"}
            </Button>

            {selectMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllImages}
                  className="text-sm text-black"
                >
                  {selectedForDelete.length === imgs.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelectedImages}
                  disabled={selectedForDelete.length === 0 || isDeleting}
                  className="text-sm"
                >
                  {isDeleting
                    ? "Deleting..."
                    : `Delete (${selectedForDelete.length})`}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Selected media and upload controls */}
        <div className="h-16flex flex-col justify-between items-center py-5">
          <div
            className={` ${
              selectedMedia.length === 0 ? "hidden" : "flex justify-end gap-4"
            }`}
          >
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="text-sm"
            >
              {isUploading ? "Uploading..." : "Upload All"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedMedia([])}
              disabled={isUploading}
              className="text-sm text-red-600"
            >
              Cancel
            </Button>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-5">
            {selectedMedia.map((media, index) => (
              <div key={index} className="relative">
                {isVideoFile(media) ? (
                  <div className="w-16 h-16 bg-gray-800 flex items-center justify-center rounded relative">
                    <Video size={24} className="text-white" />
                    <span className="text-xs text-white absolute bottom-1 w-full text-center truncate px-1">
                      {media.name?.length > 10
                        ? media.name.substring(0, 7) + "..."
                        : media.name}
                    </span>
                  </div>
                ) : (
                  <Image
                    src={URL.createObjectURL(media)}
                    alt="selected media"
                    width={100}
                    height={100}
                    className="w-16 h-16 object-cover relative rounded"
                  />
                )}
                <button
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  onClick={() =>
                    setSelectedMedia((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Masonry gallery */}
      <div className="overflow-y-auto h-[90vh] py-20 md:px-[5vw] col-span-4">
        <div className="flex flex-wrap -mx-2">
          {mediaColumns.map((column, colIndex) => (
            <div
              key={`col-${colIndex}`}
              className={`px-2 ${
                numOfColumns === 2
                  ? "w-1/2"
                  : numOfColumns === 3
                  ? "w-1/3"
                  : "w-1/4"
              }`}
            >
              {column.map((item) => (
                <div key={item.key} className="mb-4">
                  {item.type === "upload" ? (
                    <div
                      onClick={() => inputRef.current.click()}
                      className="aspect-square mx-2 bg-gray-100 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-gray-200 transition-all border border-dashed border-gray-300"
                    >
                      <Plus size={24} className="text-gray-500" />
                      <span className="text-sm text-gray-500 mt-2">
                        Add Media
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        ref={inputRef}
                        className="hidden"
                        onChange={handleNewMedia}
                        multiple
                      />
                    </div>
                  ) : (
                    <div
                      className={`relative group mx-2 cursor-pointer`}
                      onClick={() =>
                        selectMode
                          ? toggleSelectImage(item.path)
                          : handleMediaClick(item.index, item)
                      }
                    >
                      {item.isVideo ? (
                        <div className="w-full h-fit media-section bg-gray-900 rounded-lg relative flex items-center justify-center overflow-hidden">
                          {/* Use poster image for better performance */}
                          <video
                            className="w-full h-auto max-h-[60vh] object-cover"
                            preload="metadata"
                            // poster="/api/placeholder/400/300"
                          >
                            {/* Fix: Stream correct content without full download */}
                            <source src={item.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <Play size={24} className="text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image
                          width={1000}
                          height={1000}
                          src={item.url}
                          alt={`Gallery image ${item.key}`}
                          className={`w-full h-auto max-h-[60vh] rounded-lg object-cover media-section ${
                            selectMode && selectedForDelete.includes(item.path)
                              ? "opacity-70"
                              : ""
                          }`}
                        />
                      )}
                      {/* Selection indicator */}
                      {selectMode && (
                        <div className="absolute top-2 right-2 z-10">
                          {selectedForDelete.includes(item.path) ? (
                            <CheckSquare className="h-6 w-6 text-blue-500 bg-white rounded" />
                          ) : (
                            <Square className="h-6 w-6 text-gray-400 bg-white bg-opacity-70 rounded" />
                          )}
                        </div>
                      )}
                      {/* Hover overlay */}
                      {!selectMode && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg"></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Image Popup - only pass image files, not videos */}
      <ImagePopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        images={images}
        initialIndex={popupImageIndex}
      />

      {/* Video Preview Modal */}
      {videoPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="w-fit max-w-4xl bg-black rounded-lg overflow-hidden">
            <div className="p-2 flex justify-between items-center">
              <h3 className="text-white text-lg truncate">
                {videoPreview.name || "Video Preview"}
              </h3>
              <button
                onClick={closeVideoPreview}
                className="text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            <video
              controls
              autoPlay
              className="h-[70vh]"
              src={videoPreview.url}
              controlsList="nodownload"
            >
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSection;
