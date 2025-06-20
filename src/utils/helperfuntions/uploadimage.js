import cloudinary from "../../../config/cloudinary.config.js";


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

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};