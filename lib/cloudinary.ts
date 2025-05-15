// This file provides a universal API for Cloudinary operations
// It will use the server version on the server and client version on the client

// Import both client and server implementations
import * as CloudinaryServer from "./cloudinary.server";
import * as CloudinaryClient from "./cloudinary.client";

// Determine which implementation to use
const isServer = typeof window === "undefined";

// Export the appropriate implementation
export const uploadImageToCloudinary = isServer
  ? CloudinaryServer.uploadImageToCloudinary
  : CloudinaryClient.uploadImageToCloudinary;

export const deleteImageFromCloudinary = isServer
  ? CloudinaryServer.deleteImageFromCloudinary
  : CloudinaryClient.deleteImageFromCloudinary;

// Re-export the interface
export type CloudinaryUploadResult = CloudinaryServer.CloudinaryUploadResult;
