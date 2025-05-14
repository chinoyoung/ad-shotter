import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
}

/**
 * Uploads an image buffer to Cloudinary
 *
 * @param imageBuffer - The image buffer to upload
 * @param folderName - The folder to upload to in Cloudinary
 * @returns The upload result with image details
 */
export async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  fileName: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: "screenshots",
      public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      resource_type: "image",
    };

    // Use the upload stream API for buffers
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Upload failed - no result returned"));
        }

        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
        });
      })
      .end(imageBuffer);
  });
}
