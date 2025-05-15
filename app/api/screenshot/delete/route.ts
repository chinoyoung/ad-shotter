import { NextRequest, NextResponse } from "next/server";
import { deleteScreenshotFromCloudinary } from "@/lib/activityService.server";
import { deleteScreenshotActivity } from "@/lib/activityService";
import { cookies } from "next/headers";
import { User } from "firebase/auth";

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication using cookies
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("firebase-auth-token");
    const userEmail = cookieStore.get("user-email");

    if (!authCookie || !authCookie.value || !userEmail || !userEmail.value) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Create a user object with the information from cookies
    const authUser = {
      uid: authCookie.value,
      email: userEmail.value,
      displayName: null,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: "",
      tenantId: null,
      delete: async () => Promise.resolve(),
      getIdToken: async () => Promise.resolve(""),
      getIdTokenResult: async () => Promise.resolve({ token: "" } as any),
      reload: async () => Promise.resolve(),
      toJSON: () => ({}),
    } as unknown as User;

    // Parse the request - it should include the activityId and cloudinaryId
    const { activityId, cloudinaryId } = await request.json();

    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    // First delete from Cloudinary if a cloudinaryId is provided
    let cloudinarySuccess = true;
    if (cloudinaryId) {
      cloudinarySuccess = await deleteScreenshotFromCloudinary(cloudinaryId);

      if (!cloudinarySuccess) {
        console.warn(`Failed to delete image from Cloudinary: ${cloudinaryId}`);
        // Continue with Firestore deletion even if Cloudinary deletion fails
      }
    }

    // Then delete the activity from Firestore
    const firestoreResult = await deleteScreenshotActivity(
      activityId,
      authUser
    );

    return NextResponse.json({
      success: firestoreResult,
      cloudinaryDeleted: cloudinarySuccess,
      message: firestoreResult
        ? "Screenshot deleted successfully"
        : "Failed to delete screenshot activity",
    });
  } catch (error) {
    console.error("Error handling screenshot deletion:", error);
    return NextResponse.json(
      { error: "Failed to delete screenshot" },
      { status: 500 }
    );
  }
}
