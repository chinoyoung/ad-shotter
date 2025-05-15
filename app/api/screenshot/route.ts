import { NextRequest, NextResponse } from "next/server";
import { takeScreenshot, ScreenshotResult } from "@/lib/screenshot";
import { recordScreenshotActivity } from "@/lib/activityService";
import { auth } from "@/lib/firebase";
import { cookies } from "next/headers";
import { User } from "firebase/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication using cookies instead of auth.currentUser
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
    const user = {
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
    } as unknown as User; // First cast to unknown then to User to avoid type checking

    // Parse the request body
    const body = await request.json();
    const { url, selector, viewport } = body;

    // Validate required fields
    if (!url || !selector) {
      return NextResponse.json(
        { error: "URL and CSS selector are required" },
        { status: 400 }
      );
    }

    // Take the screenshot
    let result: ScreenshotResult;
    try {
      result = await takeScreenshot(url, selector, viewport);
    } catch (screenshotError) {
      console.error("Screenshot capture error:", screenshotError);
      return NextResponse.json(
        {
          error: `Failed to capture screenshot: ${
            (screenshotError as Error).message
          }`,
          details: (screenshotError as Error).stack,
        },
        { status: 500 }
      );
    }

    // Check if Cloudinary was used or local fallback
    const storageMethod = result.cloudinaryId ? "Cloudinary" : "local storage";

    // Record the activity
    let activityWarning = "";
    try {
      // Import directly from Firebase auth to get currently authenticated user
      const userAuth = auth.currentUser;

      if (userAuth) {
        // Use the actual Firebase user if available
        await recordScreenshotActivity(
          userAuth,
          url,
          selector,
          result.screenshotUrl,
          result
        );
      } else {
        // Create a minimally compatible user object if we only have cookie info
        const mockUser = {
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
        } as unknown as User; // First cast to unknown then to User to avoid type checking

        await recordScreenshotActivity(
          mockUser,
          url,
          selector,
          result.screenshotUrl,
          result
        );
      }
    } catch (activityError) {
      console.error("Failed to record activity:", activityError);
      // Continue even if activity recording fails, but include warning in response
      activityWarning = "Screenshot saved but activity tracking failed";
    }

    // Return the result with storage information
    return NextResponse.json({
      ...result,
      storageMethod,
      message: `Screenshot successfully captured and stored using ${storageMethod}`,
      ...(activityWarning && { activityWarning }),
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: `Failed to process screenshot request: ${
          (error as Error).message
        }`,
        details: (error as Error).stack,
      },
      { status: 500 }
    );
  }
}

// Make the API route available for POST requests only
export const GET = () => {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
};
