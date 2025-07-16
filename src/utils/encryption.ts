import * as crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size

function getKey() {
  const secret = process.env.SECRET || "";
  // Ensure key is 32 bytes for aes-256-cbc
  return crypto.createHash("sha256").update(secret).digest();
}

export async function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  // Prepend IV for use in decryption
  const result = iv.toString("base64") + ":" + encrypted;
  return result;
}

export async function decrypt(hashed: string): Promise<string> {
  const [ivBase64, encrypted] = hashed.split(":");
  if (!ivBase64 || !encrypted) throw new Error("Invalid encrypted data format");
  const iv = Buffer.from(ivBase64, "base64");
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
