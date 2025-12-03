"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { listCollectionFiles, deleteCollectionFile } from "@/cloudflare/upload-files";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Upload, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpload } from "@/components/UploadProvider";
import { MediaDialog } from "../Dashboard/_components/wizard/MediaDialog";

interface FileData {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  url: string;
  type?: 'image' | 'video';
  thumbnailUrl?: string;
}

export default function Media() {
  const params = useParams();
  const collectionId = params.id as string;
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { uploadFiles, isUploading, progress } = useUpload();

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await listCollectionFiles(collectionId);
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      toast.error("Failed to load media");
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Refresh files when upload completes (if we are still on this page)
  useEffect(() => {
    if (!isUploading && Object.keys(progress).length > 0) {
      fetchFiles();
    }
  }, [isUploading, fetchFiles, progress]);



  const handleDelete = () => {
    if (selectedFiles.size === 0) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(Array.from(selectedFiles).map((key) => deleteCollectionFile(key)));
      toast.success("Files deleted");
      setSelectedFiles(new Set());
      setIsSelectMode(false);
      fetchFiles();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete files");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const toggleSelection = (key: string) => {
    const newSet = new Set(selectedFiles);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedFiles(newSet);
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  const maxStorageMB = 500;
  const usagePercent = Math.min((parseFloat(totalSizeMB) / maxStorageMB) * 100, 100);

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      {/* Header Stats & Actions */}

      <div className="bg-white dark:bg-background absolute top-12 z-10 left-0 w-full h-15"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm  sticky top-0 z-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{files.length} files</span>
            <span>•</span>
            <span>{totalSizeMB} MB used of {maxStorageMB} MB</span>
          </div>
          <div className="w-48 h-2 bg-secondary rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ">
          {isSelectMode ? (
            <>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={selectedFiles.size === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedFiles.size})
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setIsSelectMode(false); setSelectedFiles(new Set()); }}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsSelectMode(true)}>
                Select
              </Button>
              <Button size="sm" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <MediaDialog
                open={isUploadDialogOpen}
                onOpenChange={(open) => {
                  setIsUploadDialogOpen(open);
                  if (!open) fetchFiles(); // Refresh on close
                }}
                selectionMode={false}
              />
            </>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`w-full rounded-xl break-inside-avoid ${['h-48', 'h-64', 'h-80', 'h-56', 'h-72', 'h-40'][i % 6]
                }`}
            />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No media files found. Upload some to get started.
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 ">
          {files.map((file, index) => (
            <div
              key={file.key}
              className="relative group break-inside-avoid rounded-xl overflow-hidden bg-secondary/20 hover:shadow-lg transition-all duration-300"
            >
              <img
                src={file.type === 'video' && file.thumbnailUrl ? file.thumbnailUrl : file.url}
                alt={file.name}
                className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                onClick={() => !isSelectMode && setLightboxIndex(index)}
                loading="lazy"
              />

              {file.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                  </div>
                </div>
              )}

              {/* Overlay for selection or actions */}
              {
                isSelectMode && (
                  <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 flex items-start justify-end p-2 ${isSelectMode || selectedFiles.has(file.key) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Checkbox
                      checked={selectedFiles.has(file.key)}
                      onCheckedChange={() => toggleSelection(file.key)}
                      className="bg-white border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent className="max-w-[95vw]! w-[95vw]! h-[95vh] p-0 bg-black/95 border-none flex flex-col items-center justify-center outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Viewer</DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-full flex items-center justify-center">
            {lightboxIndex !== null && files[lightboxIndex] && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/20 rounded-full hidden md:flex h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : files.length - 1));
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/20 rounded-full hidden md:flex h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev !== null && prev < files.length - 1 ? prev + 1 : 0));
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>

                <motion.div
                  key={files[lightboxIndex].key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full flex items-center justify-center p-4"
                >
                  {files[lightboxIndex].type === 'video' ? (
                    <video
                      src={files[lightboxIndex].url}
                      controls
                      autoPlay
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <img
                      src={files[lightboxIndex].url}
                      alt={files[lightboxIndex].name}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}

                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 text-sm bg-black/60 px-6 py-2 rounded-full backdrop-blur-sm">
                    {lightboxIndex + 1} / {files.length} • {files[lightboxIndex].name}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Files</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedFiles.size} selected file{selectedFiles.size !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
