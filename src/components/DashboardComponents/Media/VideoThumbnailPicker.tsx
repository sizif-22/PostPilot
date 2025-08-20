"use client";
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FaCamera, FaUpload, FaSpinner, FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as randomString from 'randomstring';
import { MediaItem } from '@/interfaces/Media';
import { useChannel } from '@/context/ChannelContext';

interface VideoThumbnailPickerProps {
  video: MediaItem;
  onThumbnailCreated?: (thumbnailUrl: string) => void;
  className?: string;
}

interface ThumbnailData {
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: any;
}

const VideoThumbnailPicker: React.FC<VideoThumbnailPickerProps> = ({
  video,
  onThumbnailCreated,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {channel} = useChannel();
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      setError('Video or canvas not available');
      return;
    }
    
    if (video.readyState < 2) {
      setError('Video not ready. Please wait for it to load.');
      return;
    }
    
    setIsCapturing(true);
    setError(null);
    
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob to avoid CORS taint issues
      canvas.toBlob((blob) => {
        if (blob) {
          setCapturedBlob(blob);
          const dataURL = URL.createObjectURL(blob);
          setCapturedFrame(dataURL);
          setIsUploaded(false);
          setUploadedThumbnailUrl(null);
        } else {
          setError('Failed to capture frame');
        }
        setIsCapturing(false);
      }, 'image/jpeg', 0.8);
      
    } catch (err) {
      console.error('Error capturing frame:', err);
      if (err instanceof Error && err.message.includes('tainted')) {
        setError('Cannot capture frame due to CORS restrictions. The video must be served with proper CORS headers.');
      } else {
        setError('Failed to capture frame. Make sure the video is loaded and playing.');
      }
      setIsCapturing(false);
    }
  }, []);

  const uploadThumbnail = useCallback(async () => {
    if (!capturedBlob) {
      setError('No frame captured to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Generate unique filename
      const fileId = `${video.name.split(".")[0]}.jpg`;
      const thumbnailPath = `${channel?.id}/thumbnails/${fileId}`;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, thumbnailPath);
      const uploadTask = await uploadBytes(storageRef, capturedBlob);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      // Save to Firestore
      const thumbnailData: ThumbnailData = {
        videoUrl:video.url,
        thumbnailUrl: downloadURL,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'videos'), thumbnailData);
      
      setUploadedThumbnailUrl(downloadURL);
      setIsUploaded(true);
      
      // Call callback if provided
      onThumbnailCreated?.(downloadURL);
      
    } catch (err) {
      console.error('Error uploading thumbnail:', err);
      setError('Failed to upload thumbnail');
    } finally {
      setIsUploading(false);
    }
  }, [capturedBlob, video.url, onThumbnailCreated]);

  const handleVideoLoad = useCallback(() => {
    // Reset states when video loads
    if (capturedFrame && capturedFrame.startsWith('blob:')) {
      URL.revokeObjectURL(capturedFrame);
    }
    setCapturedFrame(null);
    setCapturedBlob(null);
    setIsUploaded(false);
    setUploadedThumbnailUrl(null);
    setError(null);
  }, [capturedFrame]);

  // Cleanup blob URLs on unmount
  React.useEffect(() => {
    return () => {
      if (capturedFrame && capturedFrame.startsWith('blob:')) {
        URL.revokeObjectURL(capturedFrame);
      }
    };
  }, [capturedFrame]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={video.url}
          controls
          crossOrigin="anonymous"
          className="w-full h-auto max-h-[60vh]"
          onLoadedData={handleVideoLoad}
          preload="metadata"
          onError={() => setError('Failed to load video. If this is an external URL, it may not support CORS.')}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Capture Button Overlay */}
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={captureFrame}
            disabled={isCapturing || isUploading}
            className="bg-white/90 hover:bg-white text-black hover:text-black border border-gray-300"
          >
            {isCapturing ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaCamera className="mr-2" />
            )}
            Capture Frame
          </Button>
        </div>
      </div>
      
      {/* Hidden Canvas for Frame Capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          {error.includes('CORS') && (
            <div className="mt-2 text-xs text-red-500 dark:text-red-400">
              <p>Solutions:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Ensure the video is served with proper CORS headers</li>
                <li>Use videos uploaded to your Firebase Storage</li>
                <li>Serve videos from the same domain</li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Captured Frame Preview and Upload */}
      {capturedFrame && (
        <div className="space-y-4">
          <div className="border border-stone-200 dark:border-stone-700 rounded-lg p-4 bg-stone-50 dark:bg-stone-900">
            <h3 className="text-lg font-medium mb-3 dark:text-white">
              Captured Thumbnail
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4">
              {/* Thumbnail Preview */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-32 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden">
                  <Image
                    src={capturedFrame}
                    alt="Captured thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={uploadThumbnail}
                    disabled={isUploading || isUploaded}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : isUploaded ? (
                      <>
                        <FaCheck className="mr-2" />
                        Uploaded
                      </>
                    ) : (
                      <>
                        <FaUpload className="mr-2" />
                        Upload Thumbnail
                      </>
                    )}
                  </Button>
                  
                  {isUploaded && uploadedThumbnailUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(uploadedThumbnailUrl, '_blank')}
                      className="dark:bg-stone-800 dark:text-white dark:border-stone-600"
                    >
                      View Uploaded
                    </Button>
                  )}
                </div>
                
                {isUploaded && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      Thumbnail uploaded successfully! The thumbnail URL has been saved to Firestore.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoThumbnailPicker;