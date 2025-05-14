import puppeteer, { Browser, Page } from "puppeteer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { uploadImageToCloudinary } from "./cloudinary";

// Make sure the screenshots directory exists (for fallback)
const screenshotsDir = path.join(process.cwd(), "public", "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
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
      fs.writeFileSync(filePath, screenshotBuffer);

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

  return await element.screenshot();
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
