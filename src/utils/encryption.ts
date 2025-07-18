import * as crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size

function getKey() {
  const secret = process.env.SECRET || "";
  
  if (!secret) {
    throw new Error("SECRET environment variable is not set");
  }
  
  // DEBUG: Log the secret length and a hash (not the secret itself)
  if (process.env.NODE_ENV !== "production") {
    console.log("[ENCRYPTION DEBUG] SECRET length:", secret.length);
    console.log(
      "[ENCRYPTION DEBUG] SECRET sha256:",
      crypto.createHash("sha256").update(secret).digest("hex")
    );
  }
  
  // Ensure key is 32 bytes for aes-256-cbc
  return crypto.createHash("sha256").update(secret).digest();
}

export async function encrypt(text: string): Promise<string> {
  if (!text) {
    throw new Error("Text to encrypt cannot be empty");
  }
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  
  // Prepend IV for use in decryption
  const result = iv.toString("base64") + ":" + encrypted;
  
  if (process.env.NODE_ENV !== "production") {
    console.log("[ENCRYPTION DEBUG] Encrypting:", {
      textLength: text.length,
      iv: iv.toString("base64"),
      encryptedLength: encrypted.length,
    });
    console.log("[ENCRYPTION DEBUG] Encrypted result:", result);
  }
  
  return result;
}

export async function decrypt(hashed: string): Promise<string> {
  if (!hashed) {
    throw new Error("Encrypted data cannot be empty");
  }
  
  if (process.env.NODE_ENV !== "production") {
    console.log("[ENCRYPTION DEBUG] Decrypting input:", hashed);
  }
  
  // Validate the encrypted data format
  const parts = hashed.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted data format - expected 'iv:encrypted' format");
  }
  
  const [ivBase64, encrypted] = parts;
  
  if (!ivBase64 || !encrypted) {
    throw new Error("Invalid encrypted data format - missing IV or encrypted data");
  }
  
  // Validate base64 format
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(ivBase64) || !base64Regex.test(encrypted)) {
    throw new Error("Invalid encrypted data format - not valid base64");
  }
  
  let iv: Buffer;
  try {
    iv = Buffer.from(ivBase64, "base64");
  } catch (error) {
    throw new Error("Invalid IV format");
  }
  
  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
  }
  
  const key = getKey();
  
  if (process.env.NODE_ENV !== "production") {
    console.log("[ENCRYPTION DEBUG] Using IV:", ivBase64);
    console.log("[ENCRYPTION DEBUG] IV length:", iv.length);
    console.log("[ENCRYPTION DEBUG] Encrypted data length:", encrypted.length);
    console.log(
      "[ENCRYPTION DEBUG] Using key sha256:",
      crypto
        .createHash("sha256")
        .update(process.env.SECRET || "")
        .digest("hex")
    );
  }
  
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    
    if (process.env.NODE_ENV !== "production") {
      console.log("[ENCRYPTION DEBUG] Decrypted result length:", decrypted.length);
    }
    
    return decrypted;
  } catch (error) {
    console.error("[ENCRYPTION ERROR] Failed to decrypt:", {
      error: error instanceof Error ? error.message : String(error),
      ivBase64,
      encryptedLength: encrypted.length,
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("bad decrypt")) {
        throw new Error("Decryption failed: The data may have been encrypted with a different key or corrupted");
      } else if (error.message.includes("wrong final block length")) {
        throw new Error("Decryption failed: Invalid padding or data corruption");
      }
    }
    
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Utility function to test if a string is properly encrypted
export function isValidEncryptedFormat(data: string): boolean {
  try {
    const parts = data.split(":");
    if (parts.length !== 2) return false;
    
    const [ivBase64, encrypted] = parts;
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    
    if (!base64Regex.test(ivBase64) || !base64Regex.test(encrypted)) {
      return false;
    }
    
    const iv = Buffer.from(ivBase64, "base64");
    return iv.length === IV_LENGTH;
  } catch {
    return false;
  }
}