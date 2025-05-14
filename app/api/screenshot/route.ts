import { NextRequest, NextResponse } from "next/server";
import { takeScreenshot } from "@/lib/screenshot";

export async function POST(request: NextRequest) {
  try {
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
    const result = await takeScreenshot(url, selector, viewport);

    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: `Failed to capture screenshot: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// Make the API route available for POST requests only
export const GET = () => {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
};
