"use client";

import { ImageInfo } from "@/lib/screenshot";

interface ScreenshotResultDisplayProps {
  screenshotUrl: string;
  width: number;
  height: number;
  images: ImageInfo[];
  selector: string;
}

export default function ScreenshotResultDisplay({
  screenshotUrl,
  width,
  height,
  images,
  selector,
}: ScreenshotResultDisplayProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Screenshot Result</h2>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Element Dimensions</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Width: {width}px, Height: {height}px
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Screenshot</h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <img
            src={screenshotUrl}
            alt="Captured screenshot"
            className="max-w-full h-auto"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Screenshot of selected element: {selector}
        </p>
      </div>

      {images.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-3">
            Images Found ({images.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="mb-3 overflow-hidden rounded-lg">
                  <img
                    src={img.src}
                    alt={img.alt || `Image ${index + 1}`}
                    className="object-contain w-full max-h-48"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <h4 className="text-xs font-medium mb-1">Rendered Size</h4>
                    <p className="text-sm">
                      {img.renderedWidth} × {img.renderedHeight}px
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <h4 className="text-xs font-medium mb-1">Intrinsic Size</h4>
                    <p className="text-sm">
                      {img.intrinsicWidth} × {img.intrinsicHeight}px
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <h4 className="text-xs font-medium mb-1">Aspect Ratio</h4>
                    <p className="text-sm">{img.aspectRatio}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <h4 className="text-xs font-medium mb-1">Scale Factor</h4>
                    <p className="text-sm">
                      {Math.round(
                        (img.renderedWidth / img.intrinsicWidth) * 100
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
