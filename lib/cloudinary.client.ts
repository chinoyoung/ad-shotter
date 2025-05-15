// This is a client-side safe version of the Cloudinary interface
// It doesn't actually do any operations but provides type-compatible stubs

/**
 * Client-side stub for CloudinaryUploadResult that's compatible with the server version
 */
export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
}

/**
 * Client-side stub for uploadImageToCloudinary
 * This function is included for type compatibility but should never be called on the client
 */
export async function uploadImageToCloudinary(
  _imageBuffer: Buffer | Uint8Array,
  _fileName: string
): Promise<CloudinaryUploadResult> {
  console.error(
    "Attempted to upload image to Cloudinary from client-side code"
  );
  throw new Error("Cloudinary upload can only be used in server components");
}

/**
 * Client-side stub for deleteImageFromCloudinary
 * This function is included for type compatibility but should never be called on the client
 */
export async function deleteImageFromCloudinary(
  _publicId: string
): Promise<boolean> {
  console.error(
    "Attempted to delete image from Cloudinary from client-side code"
  );
  throw new Error(
    "Cloudinary operations can only be used in server components"
  );
}
