import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Loader2, Check } from "lucide-react";
import Image from "next/image";
import { listCollectionFiles } from "@/cloudflare/upload-files";
import { useUpload } from "@/components/UploadProvider";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface FileData {
    key: string;
    name: string;
    size: number;
    lastModified: Date;
    url: string;
    type?: 'image' | 'video';
    thumbnailUrl?: string;
}

interface MediaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (files: FileData[]) => void;
    selectionMode?: boolean;
    initialSelection?: FileData[];
    maxSelection?: number;
}

export const MediaDialog = ({
    open,
    onOpenChange,
    onSelect,
    selectionMode = true,
    initialSelection = [],
    maxSelection = 10,
}: MediaDialogProps) => {
    const params = useParams();
    const collectionId = params.id as string;
    const [files, setFiles] = useState<FileData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState<FileData[]>(initialSelection);
    const [uploadQueue, setUploadQueue] = useState<File[]>([]);
    const [isUploadingMode, setIsUploadingMode] = useState(false);

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
        if (open) {
            fetchFiles();
            setSelectedFiles(initialSelection);
        }
    }, [open, fetchFiles, initialSelection]);

    // Refresh files when upload completes
    useEffect(() => {
        if (!isUploading && Object.keys(progress).length > 0 && open) {
            fetchFiles();
            setIsUploadingMode(false);
        }
    }, [isUploading, fetchFiles, progress, open]);

    const handleUpload = async () => {
        if (uploadQueue.length === 0) return;
        await uploadFiles(uploadQueue, collectionId, () => {
            setUploadQueue([]);
            fetchFiles();
            setIsUploadingMode(false);
        });
        setUploadQueue([]);
    };

    const toggleSelection = (file: FileData) => {
        if (!selectionMode) return;

        const isSelected = selectedFiles.some((f) => f.key === file.key);
        if (isSelected) {
            setSelectedFiles(selectedFiles.filter((f) => f.key !== file.key));
        } else {
            if (selectedFiles.length >= maxSelection) {
                toast.error(`You can only select up to ${maxSelection} files`);
                return;
            }
            setSelectedFiles([...selectedFiles, file]);
        }
    };

    const handleConfirmSelection = () => {
        if (onSelect) {
            onSelect(selectedFiles);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>
                        {isUploadingMode ? "Upload Media" : "Select Media"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {isUploadingMode ? (
                        <div className="flex-1 p-6 flex flex-col items-center justify-center">
                            <div
                                className="w-full max-w-xl border-2 border-dashed rounded-lg p-10 text-center hover:bg-accent/50 transition-colors cursor-pointer"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setUploadQueue(Array.from(e.dataTransfer.files));
                                }}
                                onClick={() => document.getElementById('dialog-file-upload')?.click()}
                            >
                                <input
                                    id="dialog-file-upload"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => setUploadQueue(Array.from(e.target.files || []))}
                                />
                                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">
                                    Drag & drop files here, or click to select
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Images and videos supported
                                </p>
                            </div>

                            {uploadQueue.length > 0 && (
                                <div className="mt-6 w-full max-w-xl space-y-2 max-h-40 overflow-y-auto">
                                    {uploadQueue.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm p-3 bg-secondary/50 rounded-lg">
                                            <span className="truncate">{file.name}</span>
                                            <span className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 p-6">
                            {isLoading ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <Skeleton key={i} className="aspect-square rounded-lg" />
                                    ))}
                                </div>
                            ) : files.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">
                                    No media files found. Upload some to get started.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {files.map((file) => {
                                        const isSelected = selectedFiles.some((f) => f.key === file.key);
                                        return (
                                            <div
                                                key={file.key}
                                                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"
                                                    }`}
                                                onClick={() => toggleSelection(file)}
                                            >
                                                <div className="aspect-square relative">
                                                    <Image
                                                        src={file.type === 'video' && file.thumbnailUrl ? file.thumbnailUrl : file.url}
                                                        alt={file.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    {file.type === 'video' && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                                                                <div className="w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-l-white border-b-4 border-b-transparent ml-0.5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/10 flex justify-between items-center sm:justify-between">
                    <div className="flex gap-2">
                        {isUploadingMode ? (
                            <Button variant="ghost" onClick={() => setIsUploadingMode(false)}>
                                Back to Library
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => setIsUploadingMode(true)}>
                                <Upload className="w-4 h-4 mr-2" /> Upload New
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        {isUploadingMode ? (
                            <Button onClick={handleUpload} disabled={uploadQueue.length === 0 || isUploading}>
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Upload {uploadQueue.length > 0 ? `(${uploadQueue.length})` : ''}
                            </Button>
                        ) : (
                            <Button onClick={handleConfirmSelection} disabled={selectionMode && selectedFiles.length === 0}>
                                Select {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
