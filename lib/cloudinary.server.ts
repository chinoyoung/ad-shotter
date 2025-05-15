// This file is intended to be used only on the server-side
// Add server-only directive
import "server-only";

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
 * This function is server-side only and should not be imported in client components.
 *
 * @param imageBuffer - The image buffer to upload
 * @param fileName - The name for the uploaded file
 * @returns The upload result with image details
 */
export async function uploadImageToCloudinary(
  imageBuffer: Buffer | Uint8Array,
  fileName: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: "screenshots",
      public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      resource_type: "image" as "image", // Type assertion to the literal "image"
    };

    // Use the upload stream API for buffers
    cloudinary.uploader
      .upload_stream(uploadOptions, (error: any, result: any) => {
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

/**
 * Deletes an image from Cloudinary by its public ID
 *
 * This function is server-side only and should not be imported in client components.
 *
 * @param publicId - The public ID of the image to delete
 * @returns A promise that resolves when the image is deleted
 */
export async function deleteImageFromCloudinary(
  publicId: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error: any, result: any) => {
      if (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return reject(error);
      }

      resolve(result.result === "ok");
    });
  });
}
