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

const uploadImage = async ({
  dir,
  file,
}: {
  dir: string;
  file: File;
}): Promise<UploadResult> => {
  try {
    const fileId = randomString.generate(10);
    const isVideo = file.type.startsWith("video/");

    // Upload the main file
    const mainStorageRef = FireStorage.ref(storage, `${dir}/${fileId}`);
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
      name: file.name,
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
export const deleteMediaFolder = async (FolderPath: string) => {
  try {
    // Create a reference to the folder
    const folderRef = ref(storage, FolderPath);

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

    console.log(`Successfully deleted folder: ${FolderPath}`);
    
  } catch (error) {
    console.error("Error deleting media folder:", error);
    throw error;
  }

};

export { uploadImage, type UploadResult };
