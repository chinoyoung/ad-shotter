// Server-side only operations for activity service
import "server-only";

import { deleteImageFromCloudinary } from "./cloudinary.server";

/**
 * Deletes a screenshot from Cloudinary
 * This function is server-side only
 */
export async function deleteScreenshotFromCloudinary(
  cloudinaryId: string
): Promise<boolean> {
  if (!cloudinaryId) {
    return false;
  }

  try {
    return await deleteImageFromCloudinary(cloudinaryId);
  } catch (error) {
    console.error("Error deleting screenshot from Cloudinary:", error);
    return false;
  }
}
