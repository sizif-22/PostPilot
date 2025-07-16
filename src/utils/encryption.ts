import * as crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size

function getKey() {
  const secret = process.env.SECRET || "";
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

export async function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  // Prepend IV for use in decryption
  const result = iv.toString("base64") + ":" + encrypted;
  if (process.env.NODE_ENV !== "production") {
    console.log("[ENCRYPTION DEBUG] Encrypting:", {
      text,
      iv: iv.toString("base64"),
      encrypted,
    });
    console.log("[ENCRYPTION DEBUG] Encrypted result:", result);
  }
  return result;
}

export async function decrypt(hashed: string): Promise<string> {
  if (process.env.NODE_ENV !== "production") {
    console.log("[ENCRYPTION DEBUG] Decrypting input:", hashed);
  }
  const [ivBase64, encrypted] = hashed.split(":");
  if (!ivBase64 || !encrypted) throw new Error("Invalid encrypted data format");
  const iv = Buffer.from(ivBase64, "base64");
  const key = getKey();
  if (process.env.NODE_ENV !== "production") {
    console.log("[ENCRYPTION DEBUG] Using IV:", ivBase64);
    console.log(
      "[ENCRYPTION DEBUG] Using key sha256:",
      crypto
        .createHash("sha256")
        .update(process.env.SECRET || "")
        .digest("hex")
    );
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  if (process.env.NODE_ENV !== "production") {
    console.log("[ENCRYPTION DEBUG] Decrypted result:", decrypted);
  }
  return decrypted;
}
