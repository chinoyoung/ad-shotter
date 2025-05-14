"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ImageInfo } from "@/lib/screenshot";
import { ScreenshotPreset } from "@/lib/types";
import { getPresetById } from "@/lib/presetService";
import ScreenshotResultDisplay from "@/components/ScreenshotResultDisplay";
import PresetForm from "@/components/PresetForm";
import PresetList from "@/components/PresetList";
import Notification, { NotificationType } from "@/components/Notification";
import ScreenshotHistory, {
  ScreenshotHistoryItem,
} from "@/components/ScreenshotHistory";

interface ScreenshotResult {
  screenshotUrl: string;
  width: number;
  height: number;
  images: ImageInfo[];
}

export default function ScreenshotToolPage() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [selector, setSelector] = useState("");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(800);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [showPresetList, setShowPresetList] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<
    ScreenshotPreset | undefined
  >(undefined);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Handle loading preset from URL parameter
  useEffect(() => {
    const presetId = searchParams.get("preset");
    if (presetId) {
      loadPresetById(presetId);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          selector,
          viewport: {
            width: parseInt(width.toString()),
            height: parseInt(height.toString()),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to capture screenshot");
      }

      // Parse JSON response once
      const data = await response.json();
      setResult(data);

      // Save to screenshot history and dispatch event
      saveToHistory({
        id: Date.now().toString(),
        timestamp: Date.now(),
        url,
        selector,
        viewportWidth: width,
        viewportHeight: height,
        screenshotUrl: data.screenshotUrl,
        width: data.width,
        height: data.height,
        cloudinaryId: data.cloudinaryId,
      });

      // Set success notification with storage method info if available
      const storageInfo = data.storageMethod
        ? ` using ${data.storageMethod}`
        : "";
      setNotification({
        message:
          data.message || `Screenshot captured successfully${storageInfo}!`,
        type: "success",
      });
    } catch (err) {
      setError((err as Error).message);
      setNotification({
        message: `Failed to capture screenshot: ${(err as Error).message}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: ScreenshotPreset) => {
    setUrl(preset.url);
    setSelector(preset.selector);
    setWidth(preset.viewportWidth);
    setHeight(preset.viewportHeight);
    setShowPresetList(false);
  };

  const handleCreateNewPreset = () => {
    setCurrentPreset(undefined);
    setShowPresetForm(true);
    setShowPresetList(false);
  };

  const handleEditPreset = (preset: ScreenshotPreset) => {
    setCurrentPreset(preset);
    setShowPresetForm(true);
    setShowPresetList(false);
  };

  const handleSavePreset = () => {
    setShowPresetForm(false);
    setCurrentPreset(undefined);
  };

  const handleSaveAsPreset = () => {
    // Create a new preset from current settings
    const newPreset: Omit<ScreenshotPreset, "id"> = {
      name: "", // Will be filled in the form
      url,
      selector,
      viewportWidth: width,
      viewportHeight: height,
      category: "", // Will be selected in the form
      subcategory: "", // Will be selected in the form
    };

    setCurrentPreset(newPreset as ScreenshotPreset);
    setShowPresetForm(true);
  };

  // Load a preset by ID from Firebase
  const loadPresetById = async (id: string) => {
    try {
      setIsLoading(true);
      const preset = await getPresetById(id);

      if (preset) {
        setUrl(preset.url);
        setSelector(preset.selector);
        setWidth(preset.viewportWidth);
        setHeight(preset.viewportHeight);
        setNotification({
          message: `Loaded preset: ${preset.name}`,
          type: "success",
        });
      } else {
        setError("Preset not found. It may have been deleted.");
      }
    } catch (err) {
      setError("Failed to load preset. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save screenshot to history and dispatch event - no local storage
  const saveToHistory = (historyItem: ScreenshotHistoryItem) => {
    try {
      // Dispatch a custom event to notify the dashboard of the new activity
      try {
        const event = new CustomEvent("screenshot-taken", {
          detail: {
            screenshotUrl: historyItem.screenshotUrl,
            timestamp: historyItem.timestamp,
          },
        });
        window.dispatchEvent(event);
      } catch (eventError) {
        console.error("Failed to dispatch screenshot event:", eventError);
      }
    } catch (err) {
      console.error("Failed to process screenshot history", err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ad Shotter Tool</h1>

      {showPresetForm ? (
        <PresetForm
          preset={currentPreset}
          onSave={handleSavePreset}
          onCancel={() => setShowPresetForm(false)}
        />
      ) : showPresetList ? (
        <PresetList
          onSelectPreset={handleSelectPreset}
          onEdit={handleEditPreset}
          onCreateNew={handleCreateNewPreset}
        />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Capture Screenshot of Webpage Element
              </h2>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPresetList(true)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Load Preset
                </button>
                <button
                  type="button"
                  onClick={handleSaveAsPreset}
                  disabled={!url || !selector}
                  className="px-3 py-1.5 border border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-sm rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save As Preset
                </button>
              </div>
            </div>

            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="selector"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  CSS Selector
                </label>
                <input
                  type="text"
                  id="selector"
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  placeholder="#main-content or .hero-section"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the CSS selector of the element you want to capture
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="width"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Viewport Width
                  </label>
                  <input
                    type="number"
                    id="width"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                    min="320"
                    max="2560"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="height"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Viewport Height
                  </label>
                  <input
                    type="number"
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    min="320"
                    max="2560"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Capturing..." : "Capture Screenshot"}
                </button>
              </div>
            </form>
          </div>

          {isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Capturing screenshot...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {result && (
            <ScreenshotResultDisplay
              screenshotUrl={result.screenshotUrl}
              width={result.width}
              height={result.height}
              images={result.images}
              selector={selector}
            />
          )}

          {/* Show screenshot history */}
          <ScreenshotHistory />
        </>
      )}
    </div>
  );
}
