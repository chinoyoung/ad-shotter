import "server-only"; // Mark this module as server-side only
import puppeteer, { Browser, Page } from "puppeteer";
import sharp from "sharp";
import { uploadImageToCloudinary } from "./cloudinary";
import { v4 as uuidv4 } from "uuid";

// Server-side only imports
import * as fs from "fs";
import * as path from "path";

// Declare screenshots directory location
const screenshotsDir = path.join(process.cwd(), "public", "screenshots");

// Make sure the screenshots directory exists (server-side only)
if (typeof process !== "undefined" && process.release?.name === "node") {
  try {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  } catch (error) {
    console.error("Failed to create screenshots directory:", error);
  }
}

export interface ImageInfo {
  renderedWidth: number;
  renderedHeight: number;
  intrinsicWidth: number;
  intrinsicHeight: number;
  aspectRatio: string;
  src: string;
  alt?: string;
}

export interface ScreenshotResult {
  screenshotUrl: string;
  width: number;
  height: number;
  images: ImageInfo[];
  cloudinaryId?: string;
  activityWarning?: string;
}

export async function takeScreenshot(
  url: string,
  selector: string,
  viewport = { width: 1280, height: 800 }
): Promise<ScreenshotResult> {
  let browser: Browser | null = null;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true, // Use true instead of "new"
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Open new page
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport(viewport);

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for the selector to be available
    await page.waitForSelector(selector, { timeout: 5000 });

    // Get element dimensions
    const dimensions = await getDimensions(page, selector);

    // Take screenshot of the element
    const screenshotBuffer = await takeElementScreenshot(page, selector);

    // Get information about images within the element
    const imagesInfo = await getImagesInfo(page, selector);

    // Generate a unique filename
    const filename = `${uuidv4()}.png`;

    // Upload to Cloudinary
    try {
      const cloudinaryResult = await uploadImageToCloudinary(
        screenshotBuffer,
        filename
      );

      return {
        screenshotUrl: cloudinaryResult.secureUrl,
        width: dimensions.width,
        height: dimensions.height,
        images: imagesInfo,
        cloudinaryId: cloudinaryResult.publicId,
      };
    } catch (cloudinaryError) {
      console.error(
        "Cloudinary upload failed, falling back to local storage:",
        cloudinaryError
      );

      // Fallback to local storage if Cloudinary upload fails
      const filePath = path.join(screenshotsDir, filename);

      // Safely write the file only on the server
      try {
        // Ensure we have a proper Buffer
        const buffer = Buffer.isBuffer(screenshotBuffer)
          ? screenshotBuffer
          : Buffer.from(screenshotBuffer);
        fs.writeFileSync(filePath, buffer);
      } catch (fsError) {
        console.error("Error writing to filesystem:", fsError);
        // Return error in response if we can't save the image
        throw new Error(
          "Failed to save screenshot locally after Cloudinary failure"
        );
      }

      return {
        screenshotUrl: `/screenshots/${filename}`,
        width: dimensions.width,
        height: dimensions.height,
        images: imagesInfo,
      };
    }
  } catch (error) {
    console.error("Error taking screenshot:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function getDimensions(page: Page, selector: string) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) throw new Error(`Element not found: ${sel}`);

    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  }, selector);
}

async function takeElementScreenshot(
  page: Page,
  selector: string
): Promise<Buffer> {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);

  const screenshotData = await element.screenshot();
  // Convert Uint8Array to Buffer if needed
  return Buffer.from(screenshotData);
}

async function getImagesInfo(
  page: Page,
  selector: string
): Promise<ImageInfo[]> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return [];

    const images = element.querySelectorAll("img");

    return Array.from(images).map((img) => {
      const rect = img.getBoundingClientRect();

      // Calculate aspect ratio and simplify it
      const gcd = (a: number, b: number): number => {
        return b === 0 ? a : gcd(b, a % b);
      };

      const renderedWidth = Math.round(rect.width);
      const renderedHeight = Math.round(rect.height);
      const divisor = gcd(renderedWidth, renderedHeight);

      const aspectRatioX = renderedWidth / divisor;
      const aspectRatioY = renderedHeight / divisor;

      return {
        renderedWidth: renderedWidth,
        renderedHeight: renderedHeight,
        intrinsicWidth: img.naturalWidth,
        intrinsicHeight: img.naturalHeight,
        aspectRatio: `${aspectRatioX}:${aspectRatioY}`,
        src: img.src,
        alt: img.alt,
      };
    });
  }, selector);
}
