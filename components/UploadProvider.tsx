"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import axios from "axios";
import { getMultipleUploadUrls } from "@/cloudflare/upload-files";
import { toast } from "sonner";
import { Loader2, X, Minimize2, Maximize2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

interface UploadContextType {
    uploadFiles: (files: File[], collectionId: string, onComplete?: () => void) => Promise<void>;
    isUploading: boolean;
    progress: Record<string, number>;
    queue: File[];
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [queue, setQueue] = useState<File[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set());

    const uploadToCloudinary = async (file: File, onProgress: (progress: number) => void): Promise<{ mp4: File, thumbnail: File }> => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error("Missing Cloudinary credentials");
        }

        // 1. Upload raw video to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const uploadRes = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
            formData,
            {
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded / (e.total || 1)) * 100);
                    // Map 0-100% of Cloudinary upload to 0-50% of total progress
                    onProgress(Math.round(percent * 0.5));
                }
            }
        );

        const publicId = uploadRes.data.public_id;
        const version = uploadRes.data.version;

        // 2. Construct URLs for MP4 and Thumbnail
        const mp4Url = `https://res.cloudinary.com/${cloudName}/video/upload/f_mp4/v${version}/${publicId}.mp4`;
        const thumbUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_1,f_jpg/v${version}/${publicId}.jpg`;

        // 3. Fetch the converted files
        // Processing might take a moment, so we can simulate a small progress bump or just wait
        onProgress(55); // Bump to 55% to show we are processing

        const [mp4Blob, thumbBlob] = await Promise.all([
            fetch(mp4Url).then(r => { if (!r.ok) throw new Error(`Failed to fetch MP4: ${r.statusText}`); return r.blob(); }),
            fetch(thumbUrl).then(r => { if (!r.ok) throw new Error(`Failed to fetch Thumbnail: ${r.statusText}`); return r.blob(); })
        ]);

        onProgress(60); // Ready to upload to Cloudflare

        // 4. Create File objects
        const mp4Name = `${file.name.replace(/\.[^/.]+$/, "")}.mp4`;
        const mp4File = new File([mp4Blob], mp4Name, { type: "video/mp4" });
        const thumbFile = new File([thumbBlob], `${mp4Name}.jpg`, { type: "image/jpeg" });

        return { mp4: mp4File, thumbnail: thumbFile };
    };

    const uploadFiles = useCallback(async (files: File[], collectionId: string, onComplete?: () => void) => {
        if (files.length === 0) return;

        setIsUploading(true);
        setQueue((prev) => [...prev, ...files]);
        setIsMinimized(false);

        try {
            const uploadTasks = [];

            // 1. Process files
            for (const file of files) {
                const isVideo = file.type.startsWith('video/');

                if (isVideo) {
                    try {
                        // Use Cloudinary for conversion
                        const { mp4, thumbnail } = await uploadToCloudinary(file, (percent) => {
                            setProgress((prev) => ({ ...prev, [file.name]: percent }));
                        });
                        uploadTasks.push({ file: mp4, type: 'video', thumbnail: thumbnail, originalName: file.name });
                    } catch (e) {
                        console.error("Cloudinary processing failed", e);
                        toast.error(`Failed to process video ${file.name}. Check Cloudinary credentials.`);
                        // Fallback: upload original if conversion fails, but without thumbnail
                        uploadTasks.push({ file, type: 'video', originalName: file.name });
                    }
                } else {
                    uploadTasks.push({ file, type: 'image', originalName: file.name });
                }
            }

            // 2. Prepare metadata for getting signed URLs
            const allFilesMeta = [];
            for (const task of uploadTasks) {
                // Main file
                allFilesMeta.push({
                    filename: task.file.name,
                    contentType: task.file.type,
                    keyPrefix: `collections/${collectionId}/`
                });

                // Thumbnail (if exists)
                if (task.type === 'video' && task.thumbnail) {
                    allFilesMeta.push({
                        filename: task.thumbnail.name,
                        contentType: task.thumbnail.type,
                        keyPrefix: `thumbnails/${collectionId}/`
                    });
                }
            }

            // 3. Get signed URLs
            const signedUrls = await getMultipleUploadUrls(allFilesMeta, collectionId);

            // Map signed URLs back to tasks
            const urlMap = new Map<string, string>();
            signedUrls.forEach(item => {
                urlMap.set(item.filename, item.url);
            });

            // 4. Upload files
            const uploadPromises = [];

            for (const task of uploadTasks) {
                // Upload main file
                const mainUrl = urlMap.get(task.file.name);
                if (mainUrl) {
                    uploadPromises.push(
                        axios.put(mainUrl, task.file, {
                            headers: { "Content-Type": task.file.type },
                            onUploadProgress: (e) => {
                                const percent = Math.round((e.loaded / (e.total || 1)) * 100);
                                // For videos, map 0-100% of Cloudflare upload to 60-100% of total
                                // For images, map 0-100% to 0-100%
                                let finalPercent = percent;
                                if (task.type === 'video') {
                                    finalPercent = 60 + Math.round(percent * 0.4);
                                }
                                setProgress((prev) => ({ ...prev, [task.originalName]: finalPercent }));
                            },
                        }).then(() => {
                            setCompletedFiles(prev => new Set(prev).add(task.originalName));
                        })
                    );
                }

                // Upload thumbnail
                if (task.type === 'video' && task.thumbnail) {
                    const thumbUrl = urlMap.get(task.thumbnail.name);
                    if (thumbUrl) {
                        uploadPromises.push(
                            axios.put(thumbUrl, task.thumbnail, {
                                headers: { "Content-Type": task.thumbnail.type }
                            })
                        );
                    }
                }
            }

            await Promise.all(uploadPromises);

            toast.success("Files uploaded successfully");
            if (onComplete) onComplete();
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload files");
        } finally {
            setIsUploading(false);
            setTimeout(() => {
                setQueue([]);
                setProgress({});
                setCompletedFiles(new Set());
            }, 3000);
        }
    }, []);

    const totalProgress = queue.length > 0
        ? Object.values(progress).reduce((a, b) => a + b, 0) / queue.length
        : 0;

    return (
        <UploadContext.Provider value={{ uploadFiles, isUploading, progress, queue }}>
            {children}

            <AnimatePresence>
                {queue.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={`fixed bottom-4 right-4 z-50 bg-card border shadow-xl rounded-lg overflow-hidden transition-all duration-300 ${isMinimized ? "w-64" : "w-80"}`}
                    >
                        <div className="bg-primary/5 p-3 flex items-center justify-between border-b">
                            <div className="flex items-center gap-2">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                <span className="text-sm font-medium">
                                    {isUploading ? `Uploading ${queue.length} files...` : "Upload Complete"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
                                    {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                                </Button>
                                {!isUploading && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setQueue([]); setProgress({}); setCompletedFiles(new Set()); }}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {!isMinimized && (
                            <div className="p-3 max-h-60 overflow-y-auto space-y-2">
                                {queue.map((file, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="truncate max-w-[180px]">{file.name}</span>
                                            <span className="text-muted-foreground">{progress[file.name] || 0}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${completedFiles.has(file.name) ? "bg-green-500" : "bg-primary"}`}
                                                style={{ width: `${progress[file.name] || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isMinimized && isUploading && (
                            <div className="h-1 w-full bg-secondary">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${totalProgress}%` }} />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </UploadContext.Provider>
    );
}

export function useUpload() {
    const context = useContext(UploadContext);
    if (context === undefined) {
        throw new Error("useUpload must be used within an UploadProvider");
    }
    return context;
}
