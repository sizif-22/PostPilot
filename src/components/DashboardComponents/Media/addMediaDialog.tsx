import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaUpload, FaImage, FaVideo, FaTrash } from "react-icons/fa";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { MediaPreviewProps } from "@/interfaces/Media";
import { useParams } from "next/navigation";
import { uploadImage } from "@/firebase/storage";

const MediaPreview: React.FC<MediaPreviewProps> = ({ file, onRemove }) => {
  const { id } = useParams();
  const isImage = file.type.startsWith("image/");
  const previewUrl = URL.createObjectURL(file);

  return (
    <div className="relative group">
      <div className="aspect-square w-24 rounded-lg overflow-hidden bg-stone-100">
        {isImage ? (
          <Image
            src={previewUrl}
            alt={file.name}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="relative flex items-center justify-center h-full">
            <video className="object-cover w-full h-full" preload="metadata">
              <source src={previewUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-md">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <FaVideo size={12} className="text-white" />
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(file)}
        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <FaTrash className="w-2.5 h-2.5" />
      </button>
      <p className="mt-1 text-xs text-stone-600 truncate max-w-[96px]">
        {file.name}
      </p>
    </div>
  );
};

interface MediaDialogProps {
  storageUsed: number;
  storageLimit: number;
  onUploadComplete?: () => void;
}

const MediaDialog = ({
  storageUsed,
  storageLimit,
  onUploadComplete,
}: MediaDialogProps) => {
  const { id } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFileType = (file: File) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/tiff",
      "image/heif",
      "image/webp",
      "image/heic",
    ];

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
    ];

    return (
      allowedImageTypes.includes(file.type) ||
      allowedVideoTypes.includes(file.type)
    );
  };

  const handleNewMedia = (files: File[]) => {
    const validFiles = files.filter((file) => validateFileType(file));

    if (validFiles.length > 0) {
      const newFilesSize =
        validFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);

      if (storageUsed + newFilesSize > storageLimit) {
        alert(
          `Adding these files would exceed your storage limit of ${storageLimit}MB. Current usage: ${storageUsed.toFixed(
            1
          )}MB`
        );
        return;
      }

      setSelectedMedia((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleNewMedia(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleNewMedia(files);
  };

  const handleRemoveMedia = (fileToRemove: File) => {
    setSelectedMedia((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (selectedMedia.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = selectedMedia.length;
      let completedUploads = 0;

      await Promise.all(
        selectedMedia.map(async (file) => {
          try {
            const url = await uploadImage({ dir: id as string, file });
            completedUploads++;
            const progress = Math.round((completedUploads / totalFiles) * 100);
            setUploadProgress(progress);
            return url;
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            throw error;
          }
        })
      );

      setSelectedMedia([]);
      setUploadProgress(100);
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      //close the dialog
      setOpen(false);
    }
  };

  const resetDialog = () => {
    setSelectedMedia([]);
    setUploadProgress(0);
    setIsDragOver(false);
  };

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetDialog();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <button
          className="flex text-sm items-center gap-2 bg-stone-100 dark:text-white dark:bg-stone-900 transition-colors hover:bg-violet-100 dark:hover:bg-violet-950 hover:text-violet-700 dark:hover:text-violet-300 px-3 py-1.5 rounded"
          disabled={storageUsed >= storageLimit}>
          <FaUpload className="text-violet-500" />
          <span>Upload</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] dark:bg-secondDarkBackground dark:text-white">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Upload Media</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/tiff,image/heif,image/webp,image/heic,video/*"
            ref={inputRef}
            className="hidden"
            onChange={handleFileInputChange}
            multiple
          />
          {selectedMedia.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-stone-600 dark:text-gray-400">
                  {selectedMedia.length}{" "}
                  {selectedMedia.length === 1 ? "file" : "files"} selected
                  {isDragOver && (
                    <span className="ml-2 text-violet-600 dark:text-violet-400">
                      - Drop to add more files
                    </span>
                  )}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 dark:bg-darkButtons dark:hover:bg-gray-700 dark:text-white dark:hover:bg-darkBorder">
                  <FaUpload className="w-3 h-3" />
                  Add More
                </Button>
              </div>
              <div>
                <ScrollArea
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={` h-[400px] w-full rounded-md border-2 dark:border-gray-700 p-4 transition-colors ${
                    isDragOver
                      ? "bg-violet-50 dark:bg-violet-950/20 border-2 border-dashed border-violet-500 rounded-lg"
                      : ""
                  }`}>
                  <div className="grid grid-cols-5 gap-3">
                    {selectedMedia.map((file, index) => (
                      <MediaPreview
                        key={`${file.name}-${index}`}
                        file={file}
                        onRemove={handleRemoveMedia}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg cursor-pointer transition-colors dark:border-darkBorder ${
                isDragOver
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                  : "border-stone-300 hover:bg-stone-50 dark:hover:bg-darkButtons"
              }`}>
              <FaImage
                className={`w-12 h-12 mb-4 transition-colors ${
                  isDragOver
                    ? "text-violet-500"
                    : "text-stone-300 dark:text-gray-500"
                }`}
              />
              <p
                className={`transition-colors ${
                  isDragOver
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-stone-500 dark:text-gray-400"
                }`}>
                {isDragOver
                  ? "Drop files here"
                  : "Drag and drop or click to upload"}
              </p>
              <p className="text-stone-400 dark:text-gray-500 text-sm mt-2">
                Supported formats: JPEG, PNG, GIF, TIFF, WEBP, MP4, WEBM
              </p>
            </div>
          )}

          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-stone-500 dark:text-gray-400 mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="dark:border-gray-700">
          <div className="flex justify-between w-full">
            <p className="text-sm text-stone-500 dark:text-gray-400">
              <span
                className={
                  storageUsed > storageLimit * 0.9
                    ? "text-red-500 font-medium"
                    : ""
                }>
                {storageUsed.toFixed(1)}MB
              </span>
              {" / "}
              <span>{storageLimit}MB used</span>
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={resetDialog}
                disabled={selectedMedia.length === 0 || isUploading}
                className="dark:bg-darkButtons dark:text-white dark:hover:bg-darkBorder">
                Clear
              </Button>
              <Button
                onClick={handleUpload}
                disabled={
                  selectedMedia.length === 0 ||
                  isUploading ||
                  storageUsed >= storageLimit
                }
                className="dark:bg-violet-600 dark:hover:bg-violet-700 dark:text-white">
                Upload {selectedMedia.length > 0 && `(${selectedMedia.length})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaDialog;
