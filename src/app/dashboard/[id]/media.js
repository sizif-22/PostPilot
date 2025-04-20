"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { uploadImage } from "@/app/Firebase/firebase.storage";
import { Plus, Trash2, CheckSquare, Square, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ImagePopup from "./ImagePopup"; // Import the new component

const validateFileType = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/heif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    return false;
  }
  return true;
};

const STORAGE_LIMIT_MB = 500; // 500MB total storage limit

const MediaSection = ({ id,imgs,isChanged,setIsChanged,storageUsed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [imgs, setImgs] = useState([]);
  const [selectedImgs, setSelectedImgs] = useState([]);
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  // const [storageUsed, setStorageUsed] = useState(0); // in MB
  const inputRef = useRef(null);
  // const [isChanged, setIsChanged] = useState(false);
  // New state for the image popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupImageIndex, setPopupImageIndex] = useState(0);

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

  // const calculateStorageUsed = async (items) => {
  //   try {
  //     const { ref, getMetadata } = await import("firebase/storage");
  //     const { storage } = await import("@/app/Firebase/firebase.config");

  //     let totalSize = 0;
  //     const metadataPromises = items.map(async (imageRef) => {
  //       try {
  //         const metadata = await getMetadata(imageRef);
  //         return metadata.size; // size in bytes
  //       } catch (err) {
  //         console.error(
  //           `Error getting metadata for ${imageRef.fullPath}:`,
  //           err
  //         );
  //         return 0;
  //       }
  //     });

  //     const sizes = await Promise.all(metadataPromises);
  //     totalSize = sizes.reduce((acc, size) => acc + size, 0);

  //     // Convert bytes to MB
  //     const sizeInMB = totalSize / (1024 * 1024);
  //     setStorageUsed(parseFloat(sizeInMB.toFixed(1)));
  //   } catch (error) {
  //     console.error("Error calculating storage:", error);
  //   }
  // };

  // const fetchImgs = useCallback(async () => {
  //   try {
  //     const { ref, listAll, getDownloadURL } = await import("firebase/storage");
  //     const { storage } = await import("@/app/Firebase/firebase.config");

  //     const storageRef = ref(storage, id.toString());
  //     const result = await listAll(storageRef);

  //     // Calculate storage used
  //     calculateStorageUsed(result.items);

  //     const urlPromises = result.items.map(async (imageRef) => {
  //       try {
  //         const url = await getDownloadURL(imageRef);
  //         return {
  //           url,
  //           path: imageRef.fullPath,
  //           name: imageRef.name,
  //         };
  //       } catch (err) {
  //         console.error(`Error getting URL for ${imageRef.fullPath}:`, err);
  //         return null;
  //       }
  //     });

  //     const urlObjects = await Promise.all(urlPromises);
  //     // Filter out any null values from failed downloads
  //     const validUrlObjects = urlObjects.filter((obj) => obj !== null);
  //     setImgs(validUrlObjects);
  //   } catch (error) {
  //     console.error("Error fetching images:", error);
  //     setImgs([]);
  //   }
  // }, [id, isChanged]);

  // useEffect(() => {
  //   if (id) {
  //     fetchImgs();
  //   }
  // }, [id]);

  const handleNewImage = (e) => {
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

      setSelectedImgs((prev) => [...prev, ...validFiles]);
    }
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      // Upload all images concurrently
      await Promise.all(
        selectedImgs.map(async (img) => {
          const result = await uploadImage({
            dir: id.toString(),
            file: img,
          });

          if (!result) {
            throw new Error(`Failed to upload ${img.name}`);
          }
          return result;
        })
      );

      // Update the imgs state with the new uploads
      setIsChanged(!isChanged);

      // Clear selection after successful upload
      setSelectedImgs([]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedForDelete([]);
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
        `Are you sure you want to delete ${selectedForDelete.length} image(s)?`
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
          const imageRef = ref(storage, path);
          try {
            await deleteObject(imageRef);
          } catch (error) {
            console.error(`Error deleting image ${path}:`, error);
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

  // Function to handle image click
  const handleImageClick = (index) => {
    if (!selectMode) {
      setPopupImageIndex(index);
      setPopupOpen(true);
    }
  };

  // Function to distribute images across columns for masonry layout
  const getImageColumns = () => {
    const columns = Array(numOfColumns)
      .fill()
      .map(() => []);

    // First column always has the upload button
    columns[0].unshift({
      type: "upload",
      key: "upload-button",
    });

    // Distribute images across columns
    imgs.forEach((img, index) => {
      // Find the shortest column
      const shortestColumnIndex = columns
        .map((col, i) => ({ index: i, height: col.length }))
        .reduce((min, col) => (col.height < min.height ? col : min), {
          index: 0,
          height: Infinity,
        }).index;

      columns[shortestColumnIndex].push({
        type: "image",
        url: img.url,
        path: img.path,
        key: `img-${index}`,
        index: index, // Store the actual index for the popup
      });
    });

    return columns;
  };

  const imageColumns = getImageColumns();

  // Calculate storage percentage
  const storagePercentage = (storageUsed / STORAGE_LIMIT_MB) * 100;
  const isStorageNearLimit = storagePercentage >= 80;

  return (
    <div className="h-[90vh]">
      {/* Storage limit display */}
      <div className="px-4 md:px-12 pt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">
            Storage: {storageUsed}/{STORAGE_LIMIT_MB}MB
          </span>
          {isStorageNearLimit && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle size={16} className="mr-1" />
              Storage almost full
            </div>
          )}
        </div>
        {/* Fixed Progress component without the incorrect prop */}
        <div className="w-[20%] bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              isStorageNearLimit ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${storagePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Selection controls */}
      <div className="px-4 md:px-12 py-2 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={selectMode ? "default " : "outline"}
            size="sm"
            onClick={toggleSelectMode}
            className="text-sm text-black"
          >
            {selectMode ? "Cancel Selection" : "Select Images"}
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

      {/* Selected images and upload controls */}
      <div className="h-16 md:px-8 flex justify-between items-center p-2">
        <div className="flex gap-2 overflow-x-auto p-5">
          {selectedImgs.map((val, index) => (
            <div key={index} className="relative">
              <Image
                src={URL.createObjectURL(val)}
                alt="selected image"
                width={100}
                height={100}
                className="w-16 h-16 object-cover relative rounded"
              />
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                onClick={() =>
                  setSelectedImgs((prev) => prev.filter((_, i) => i !== index))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div
          className={`${selectedImgs.length === 0 ? "hidden" : "flex gap-2"}`}
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
            onClick={() => setSelectedImgs([])}
            disabled={isUploading}
            className="text-sm text-red-600"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Masonry gallery */}
      <div className="overflow-y-auto h-[calc(90vh-10rem)] py-2 md:px-[10vw]">
        <div className="flex flex-wrap -mx-2">
          {imageColumns.map((column, colIndex) => (
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
                      className="aspect-square mx-4 bg-gray-100 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-gray-200 transition-all border border-dashed border-gray-300"
                    >
                      <Plus size={24} className="text-gray-500" />
                      <span className="text-sm text-gray-500 mt-2">
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        ref={inputRef}
                        className="hidden"
                        onChange={handleNewImage}
                        multiple
                      />
                    </div>
                  ) : (
                    <div
                      className={`relative group mx-5 cursor-pointer`}
                      onClick={() =>
                        selectMode
                          ? toggleSelectImage(item.path)
                          : handleImageClick(item.index)
                      }
                    >
                      <Image
                        width={1000}
                        height={1000}
                        src={item.url}
                        alt={`Gallery image ${item.key}`}
                        className={`w-full h-auto max-h-[100vh] rounded-lg object-cover media-section ${
                          selectMode && selectedForDelete.includes(item.path)
                            ? "opacity-70"
                            : ""
                        }`}
                      />
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

      {/* Image Popup */}
      <ImagePopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        images={imgs}
        initialIndex={popupImageIndex}
      />
    </div>
  );
};

export default MediaSection;
