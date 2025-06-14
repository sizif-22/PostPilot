import * as FireStorage from "firebase/storage";
import * as randomString from "randomstring";
import { storage } from "./config";
import { ref, deleteObject } from "firebase/storage";

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
      const thumbnailStorageRef = FireStorage.ref(
        storage,
        `${dir}/${fileId}_thumb`
      );
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

export const deleteMedia = async (url: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const urlObj = new URL(url);
    const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
    const mediaRef = ref(storage, path);
    await deleteObject(mediaRef);
  } catch (error) {
    console.error("Error deleting media:", error);
    throw error;
  }
};

export { uploadImage, type UploadResult };
