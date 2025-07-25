// utils/encryption.js
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
// console.log(process.env.ENCRYPTION_SCERET);
const algorithm = "aes-256-cbc";
const secretKey = process.env.ENCRYPTION_SCERET

const keyBuffer = Buffer.from(secretKey);

if (keyBuffer.length !== 32) {
    throw new Error(`Invalid key byte length: ${keyBuffer.length} bytes (needs 32)`);
}

export const encryptData = (data, ivHex) => {
    // Convert hex IV to Buffer (16 bytes for AES-CBC)
    const iv = Buffer.from(ivHex, 'hex');
    
    // Validate lengths
    if (iv.length !== 16) {
        throw new Error(`Invalid IV length: ${iv.length} bytes (needs 16)`);
    }
    if (secretKey.length !== 32) {
        throw new Error(`Invalid key length: ${secretKey.length} bytes (needs 32)`);
    }

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(JSON.stringify(data), "utf-8", "hex");
    encrypted += cipher.final("hex");
    return {
        iv: ivHex, // Return original hex string for reference
        data: encrypted,
    };
};

export const decryptData = (encryptedData, ivHex) => {
    const algorithm = "aes-256-cbc";
    const secretKey = process.env.ENCRYPTION_SECRET || "12345678901234567890123456789012";

    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedData, "hex");

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
};