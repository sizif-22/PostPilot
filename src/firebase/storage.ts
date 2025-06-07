import * as FireStorage from "firebase/storage";
import * as randomString from "randomstring";
import { storage } from "./config";

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  type: string;
  name: string;
}

const uploadImage = async ({ dir, file }: { dir: string; file: File }): Promise<UploadResult> => {
  try {
    const fileId = randomString.generate(10);
    const isVideo = file.type.startsWith('video/');
    
    // Upload the main file
    const mainStorageRef = FireStorage.ref(
      storage,
      `${dir}/${fileId}`
    );
    const uploadTask = await FireStorage.uploadBytes(mainStorageRef, file);
    const url = await FireStorage.getDownloadURL(uploadTask.ref);

    let thumbnailUrl: string | undefined;

    if (isVideo) {
      // For videos, we should generate and upload a thumbnail
      // This is a placeholder - you might want to implement actual video thumbnail generation
      // For now, we'll use a default thumbnail or the first frame
      const thumbnailStorageRef = FireStorage.ref(
        storage,
        `${dir}/${fileId}_thumb`
      );
      
      // Here you would typically:
      // 1. Generate a thumbnail from the video (e.g., using canvas or a server-side function)
      // 2. Upload that thumbnail
      // For now, we'll skip this step
    }

    return {
      url,
      thumbnailUrl,
      type: file.type,
      name: file.name
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

export { uploadImage, type UploadResult };
