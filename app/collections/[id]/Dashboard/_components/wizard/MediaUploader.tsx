import React, { useState, useRef } from "react";
import Image from "next/image";
import { FiUpload } from "react-icons/fi";
import { MediaDialog } from "./MediaDialog";

interface MediaUploaderProps {
    media: any[]; // Kept for compatibility but not used for selection anymore
    selectedImages: any[];
    setSelectedImages: (images: any[]) => void;
}

export const MediaUploader = ({
    media,
    selectedImages,
    setSelectedImages,
}: MediaUploaderProps) => {
    const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
    const container = [useRef(null), useRef(null)];

    const handleImageSelect = (image: any) => {
        setSelectedImages(selectedImages.filter((img) => img.url !== image.url));
    };

    const handleDialogSelect = (files: any[]) => {
        // Merge new selection with existing, avoiding duplicates
        const newImages = [...selectedImages];
        files.forEach(file => {
            if (!newImages.some(img => img.url === file.url)) {
                newImages.push(file);
            }
        });
        setSelectedImages(newImages);
    };

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium">3. Add Media (Optional)</h4>
            <div
                ref={container[0]}
                onClick={(e) => {
                    if (e.target == container[0].current || e.target == container[1].current) {
                        setIsMediaDialogOpen(true);
                    }
                }}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
                {selectedImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2" ref={container[1]}>
                        {selectedImages.map((item: any) => (
                            <div key={item.url} className="relative group">
                                <div className="w-full aspect-square rounded-lg overflow-hidden">
                                    <Image
                                        src={item.type === 'video' && item.thumbnailUrl ? item.thumbnailUrl : item.url}
                                        alt={item.name}
                                        width={100}
                                        height={100}
                                        className="object-cover w-full h-full"
                                    />
                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-black/50 rounded-full p-1 backdrop-blur-sm">
                                                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-white border-b-[3px] border-b-transparent ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageSelect(item);
                                    }}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div onClick={() => setIsMediaDialogOpen(true)}>
                        <FiUpload className="mx-auto mb-2 w-6 h-6 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to choose from your media</p>
                        <p className="text-xs text-muted-foreground mt-1">Images and videos supported</p>
                    </div>
                )}
            </div>

            <MediaDialog
                open={isMediaDialogOpen}
                onOpenChange={setIsMediaDialogOpen}
                onSelect={handleDialogSelect}
                initialSelection={selectedImages}
            />
        </div>
    );
};
