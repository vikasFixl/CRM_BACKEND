import cloudinary from "../../../config/cloudinary.config.js";
import fs from "fs";

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

export const uploadImageToCloudinary = async ({
  file,
  folder = "user",
  oldPublicId = null, // optional: pass if replacing existing image
}) => {
 

  if (!allowedFileTypes.includes(file.mimetype)) {
    throw new Error(
      `Invalid image type. Allowed types: ${allowedFileTypes.join(", ")}`
    );
  }

  // Delete old image if public_id is provided
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (err) {
      console.warn("Failed to delete old image:", err.message);
    }
  }

  // Upload new image
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    format: "webp",
    quality: "auto:low",
    transformation: [{ width: 800, crop: "scale" }],
  });

  console.log(result);
  return {
    url: result.secure_url,
    public_id: result.public_id,
    bytes: result.bytes,
    
  };
};
// ✅ Upload any file (PDF, image, doc, etc.) to Cloudinary
export const uploadFileToCloudinary = async ({
  file,
  folder = "documents",
  oldPublicId = null, 
}) => {
  if (!file || !file.tempFilePath) {
    throw new Error("File is required for upload");
  }

  console.log("file", file);
  // If an old file needs to be replaced
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: "auto",
      });
    } catch (err) {
      console.warn("Failed to delete old Cloudinary asset:", err.message);
    }
  }

  // Upload the new file
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: "auto", // Support all file types
  });

  console.log(result,"resukltl ");

  return {
    url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    size: result.bytes,
    type: result.resource_type,
  
  };
};

// ✅ Delete any Cloudinary asset
export const deleteCloudinaryAsset = async (publicId, resourceType = "auto") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Failed to delete Cloudinary asset:", error.message);
    throw new Error("Could not delete asset");
  }
};
