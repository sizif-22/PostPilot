import * as FireStorage from "firebase/storage";
import * as randomString from "randomstring";
import { storage } from "./config";
import { ref, deleteObject, listAll } from "firebase/storage";

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  type: string;
  name: string;
}

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const convertVideoToMp4 = async (file: File): Promise<{ convertedFile: File; thumbnailUrl: string }> => {
  try {
    // Validate environment variables
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        "Cloudinary configuration is missing. Please check your environment variables."
      );
    }

    console.log(
      "Converting video:",
      file.name,
      "Size:",
      Math.round(file.size / 1024 / 1024),
      "MB"
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", "video");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error response:", errorText);
      throw new Error(
        `Cloudinary upload failed: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log("Cloudinary upload result:", result);

    // Since we can't use eager transformations with unsigned upload,
    // we'll request the MP4 version using transformation URL
    const mp4Url = result.secure_url.replace(
      "/upload/",
      "/upload/f_mp4,vc_h264,ac_aac/"
    );
    console.log("MP4 transformation URL:", mp4Url);

    const thumbnailUrl = result.secure_url.replace(/\.[^/.]+$/, ".jpg");

    // Download the converted video
    const convertedVideoResponse = await fetch(mp4Url);
    if (!convertedVideoResponse.ok) {
      // If transformation fails, try the original URL
      console.warn("MP4 transformation failed, using original file");
      const originalResponse = await fetch(result.secure_url);
      if (!originalResponse.ok) {
        throw new Error("Failed to download video from Cloudinary");
      }
      const originalBlob = await originalResponse.blob();

      // Clean up and return original file
      await cleanupCloudinaryAsset(result.public_id);
      return { convertedFile: new File([originalBlob], file.name, { type: file.type }), thumbnailUrl };
    }

    const convertedVideoBlob = await convertedVideoResponse.blob();

    // Create a new File object with the converted video
    const convertedFile = new File(
      [convertedVideoBlob],
      file.name.replace(/\.[^/.]+$/, ".mp4"), // Replace extension with .mp4
      { type: "video/mp4" }
    );

    // Clean up the Cloudinary asset
    await cleanupCloudinaryAsset(result.public_id);

    return { convertedFile, thumbnailUrl };
  } catch (error) {
    console.error("Error converting video to MP4:", error);
    throw new Error(
      `Failed to convert video to MP4: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Helper function for cleanup
const cleanupCloudinaryAsset = async (publicId: string) => {
  try {
    await fetch("/api/cloudinary/cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });
  } catch (cleanupError) {
    console.warn("Failed to cleanup Cloudinary asset:", cleanupError);
  }
};

const uploadImage = async ({
  dir,
  file,
}: {
  dir: string;
  file: File;
}): Promise<UploadResult> => {
  try {
    const isVideo = file.type.startsWith("video/");
    const fileId = `${randomString.generate(10)}.${
      isVideo ? "mp4" : file.name.split(".").pop()
    }`;
    let processedFile = file;
    let thumbnailUrl: string | undefined;

    // Convert video to MP4 if it's a video file and not already MP4
    if (isVideo && file.type !== "video/mp4") {
      console.log(`Converting ${file.name} to MP4...`);
      const conversionResult = await convertVideoToMp4(file);
      processedFile = conversionResult.convertedFile;
      thumbnailUrl = conversionResult.thumbnailUrl;
    }

    // Upload the main file (now MP4 if it was a video)
    const mainStorageRef = FireStorage.ref(storage, `${dir}/${fileId}`);
    const uploadTask = await FireStorage.uploadBytes(
      mainStorageRef,
      processedFile
    );
    const url = await FireStorage.getDownloadURL(uploadTask.ref);

    return {
      url,
      thumbnailUrl,
      type: processedFile.type,
      name: processedFile.name,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

// Fixed function name: uploadThumbnail (was uploadThubmnail - typo)
const uploadThumbnail = async ({
  dir,
  file,
}: {
  dir: string;
  file: File;
}): Promise<UploadResult> => {
  try {
    const isVideo = file.type.startsWith("video/");
    const fileId = `${randomString.generate(10)}.${
      isVideo ? "mp4" : file.name.split(".")[file.name.split(".").length - 1]
    }`;
    let processedFile = file;

    // Convert video to MP4 if it's a video file and not already MP4
    if (isVideo && file.type !== "video/mp4") {
      console.log(`Converting ${file.name} to MP4...`);
      processedFile = await convertVideoToMp4(file);
    }

    // Upload the main file (now MP4 if it was a video)
    const mainStorageRef = FireStorage.ref(storage, `${dir}/thumbnail/${fileId}`);
    const uploadTask = await FireStorage.uploadBytes(
      mainStorageRef,
      processedFile
    );
    const url = await FireStorage.getDownloadURL(uploadTask.ref);

    return {
      url,
      type: processedFile.type,
      name: processedFile.name,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

// Delete a single media file
export const deleteMedia = async (url: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const urlObj = new URL(url);
    const path = decodeURIComponent(
      urlObj.pathname.split("/o/")[1].split("?")[0]
    );
    const mediaRef = ref(storage, path);
    await deleteObject(mediaRef);
  } catch (error) {
    console.error("Error deleting media:", error);
    throw error;
  }
};

// Delete a folder and all its contents
export const deleteMediaFolder = async (folderPath: string) => {
  try {
    // Create a reference to the folder
    const folderRef = ref(storage, folderPath);

    // List all items in the folder
    const result = await listAll(folderRef);

    // Delete all files in the folder
    const deletePromises = result.items.map((item) => deleteObject(item));

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    // Also delete any subfolders recursively
    const subfolderPromises = result.prefixes.map((prefix) =>
      deleteMediaFolder(prefix.fullPath)
    );

    // Wait for all subfolder deletions to complete
    await Promise.all(subfolderPromises);

    console.log(`Successfully deleted folder: ${folderPath}`);
  } catch (error) {
    console.error("Error deleting media folder:", error);
    throw error;
  }
};

// Export both functions with corrected names
export { uploadImage, uploadThumbnail, type UploadResult };