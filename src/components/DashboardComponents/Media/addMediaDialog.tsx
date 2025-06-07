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
          <div className="flex items-center justify-center h-full">
            <FaVideo className="w-6 h-6 text-stone-400" />
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(file)}
        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
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

  const handleNewMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded"
          disabled={storageUsed >= storageLimit}
        >
          <FaUpload className="text-violet-500" />
          <span>Upload</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/tiff,image/heif,image/webp,image/heic,video/*"
            ref={inputRef}
            className="hidden"
            onChange={handleNewMedia}
            multiple
          />
          {selectedMedia.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-stone-600">
                  {selectedMedia.length}{" "}
                  {selectedMedia.length === 1 ? "file" : "files"} selected
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <FaUpload className="w-3 h-3" />
                  Add More
                </Button>
              </div>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
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
            </>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <FaImage className="w-12 h-12 text-stone-300 mb-4" />
              <p className="text-stone-500">Drag and drop or click to upload</p>
              <p className="text-stone-400 text-sm mt-2">
                Supported formats: JPEG, PNG, GIF, TIFF, HEIF, HEIC, WEBP, MP4,
                WEBM
              </p>
            </div>
          )}

          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-stone-500 mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <p className="text-sm text-stone-500">
              <span
                className={
                  storageUsed > storageLimit * 0.9
                    ? "text-red-500 font-medium"
                    : ""
                }
              >
                {storageUsed.toFixed(1)}MB
              </span>
              {" / "}
              <span>{storageLimit}MB used</span>
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedMedia([])}
                disabled={selectedMedia.length === 0 || isUploading}
              >
                Clear
              </Button>
              <Button
                onClick={handleUpload}
                disabled={
                  selectedMedia.length === 0 ||
                  isUploading ||
                  storageUsed >= storageLimit
                }
              >
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
