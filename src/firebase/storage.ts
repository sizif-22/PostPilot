import * as FireStorage from "firebase/storage";
import * as randomString from "randomstring";
import { storage } from "./config";

const uploadImage = async ({ dir, file }: { dir: string, file: File }) => {
  try {
    const storageRef = FireStorage.ref(
      storage,
      `${dir}/${randomString.generate(10)}`
      // `test/${randomString.generate(10)}`
    );
    const uploadTask = await FireStorage.uploadBytes(storageRef, file);
    const photoUrl = await FireStorage.getDownloadURL(uploadTask.ref);
    return photoUrl;
  } catch (err) {
    console.error("Error uploading profile image:", err);
  }
};

export { uploadImage };
