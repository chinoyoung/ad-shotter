"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ImageInfo } from "@/lib/screenshot";
import { ScreenshotPreset, BulkScreenshotPreset } from "@/lib/types";
import { getPresetById, getBulkPresetById } from "@/lib/presetService";
import ScreenshotResultDisplay from "@/components/ScreenshotResultDisplay";
import PresetForm from "@/components/PresetForm";
import PresetList from "@/components/PresetList";
import Notification, { NotificationType } from "@/components/Notification";
import ScreenshotHistory, {
  ScreenshotHistoryItem,
} from "@/components/ScreenshotHistory";
import BulkPresetForm from "@/components/BulkPresetForm";
import BulkPresetList from "@/components/BulkPresetList";

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

  // Bulk screenshot states
  const [showBulkPresetForm, setShowBulkPresetForm] = useState(false);
  const [showBulkPresetList, setShowBulkPresetList] = useState(false);
  const [currentBulkPreset, setCurrentBulkPreset] = useState<
    BulkScreenshotPreset | undefined
  >(undefined);
  const [bulkResults, setBulkResults] = useState<
    Array<{
      url: string;
      selector: string;
      category?: string;
      subcategory?: string;
      result: ScreenshotResult | null;
      error: string | null;
    }>
  >([]);

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

  // Handle selecting a bulk preset
  const handleSelectBulkPreset = (preset: BulkScreenshotPreset) => {
    setCurrentBulkPreset(preset);
    setWidth(preset.viewportWidth);
    setHeight(preset.viewportHeight);
    setBulkResults([]);
    setShowBulkPresetList(false);
  };

  // Handle creating a new bulk preset
  const handleCreateNewBulkPreset = () => {
    setCurrentBulkPreset(undefined);
    setShowBulkPresetForm(true);
    setShowBulkPresetList(false);
  };

  // Handle editing a bulk preset
  const handleEditBulkPreset = (preset: BulkScreenshotPreset) => {
    setCurrentBulkPreset(preset);
    setShowBulkPresetForm(true);
    setShowBulkPresetList(false);
  };

  // Handle saving a bulk preset
  const handleSaveBulkPreset = () => {
    setShowBulkPresetForm(false);
    setCurrentBulkPreset(undefined);
  };

  // Load a bulk preset by ID from Firebase
  const loadBulkPresetById = async (id: string) => {
    try {
      setIsLoading(true);
      const preset = await getBulkPresetById(id);

      if (preset) {
        setCurrentBulkPreset(preset);
        setWidth(preset.viewportWidth);
        setHeight(preset.viewportHeight);
        setNotification({
          message: `Loaded bulk preset: ${preset.name}`,
          type: "success",
        });
      } else {
        setError("Bulk preset not found. It may have been deleted.");
      }
    } catch (err) {
      setError("Failed to load bulk preset. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk screenshot capture
  const handleBulkScreenshot = async () => {
    if (!currentBulkPreset || !currentBulkPreset.items.length) {
      setError("No URLs to capture. Please select a bulk preset with URLs.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Initialize results array with pending status for all items
    const initialResults = currentBulkPreset.items.map((item) => ({
      url: item.url,
      selector: item.selector,
      category: item.category,
      subcategory: item.subcategory,
      result: null as ScreenshotResult | null,
      error: null as string | null,
    }));
    setBulkResults(initialResults);

    // Process each URL sequentially to avoid overwhelming the server
    const updatedResults = [...initialResults];

    for (let i = 0; i < currentBulkPreset.items.length; i++) {
      const item = currentBulkPreset.items[i];

      try {
        // Update UI to show which item is being processed
        setBulkResults((prevResults) => {
          const newResults = [...prevResults];
          newResults[i] = {
            ...newResults[i],
            error: null,
            result: null,
          };
          return newResults;
        });

        const response = await fetch("/api/screenshot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: item.url,
            selector: item.selector,
            viewport: {
              width: currentBulkPreset.viewportWidth,
              height: currentBulkPreset.viewportHeight,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to capture screenshot");
        }

        // Parse JSON response
        const data = await response.json();

        // Save to screenshot history
        saveToHistory({
          id: Date.now().toString() + i,
          timestamp: Date.now(),
          url: item.url,
          selector: item.selector,
          category: item.category,
          subcategory: item.subcategory,
          viewportWidth: currentBulkPreset.viewportWidth,
          viewportHeight: currentBulkPreset.viewportHeight,
          screenshotUrl: data.screenshotUrl,
          width: data.width,
          height: data.height,
          cloudinaryId: data.cloudinaryId,
        });

        // Update results
        updatedResults[i] = {
          ...updatedResults[i],
          result: data,
          error: null,
        };
        setBulkResults(updatedResults);
      } catch (err) {
        // Update with error
        updatedResults[i] = {
          ...updatedResults[i],
          error: (err as Error).message,
          result: null,
        };
        setBulkResults(updatedResults);
      }

      // Short delay between requests to prevent rate limiting
      if (i < currentBulkPreset.items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // All items processed
    setIsLoading(false);

    // Show notification with summary
    const successCount = updatedResults.filter((r) => r.result !== null).length;
    const errorCount = updatedResults.filter((r) => r.error !== null).length;

    setNotification({
      message: `Bulk screenshot completed: ${successCount} successful, ${errorCount} failed`,
      type: successCount > 0 ? "success" : "error",
    });
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
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Ad Shotter Tool
      </h1>

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
      ) : showBulkPresetForm ? (
        <BulkPresetForm
          preset={currentBulkPreset}
          onSave={handleSaveBulkPreset}
          onCancel={() => setShowBulkPresetForm(false)}
        />
      ) : showBulkPresetList ? (
        <BulkPresetList
          onSelectPreset={handleSelectBulkPreset}
          onEdit={handleEditBulkPreset}
          onCreateNew={handleCreateNewBulkPreset}
        />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {currentBulkPreset
                  ? `Bulk Screenshots: ${currentBulkPreset.name}`
                  : "Capture Screenshot of Webpage Element"}
              </h2>
              <div className="flex space-x-2">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentBulkPreset(undefined);
                      setBulkResults([]);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-l-md focus:z-10 focus:outline-none ${
                      !currentBulkPreset
                        ? "bg-blue-50 text-blue-700 border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    } border`}
                  >
                    <i className="fa-solid fa-camera mr-1"></i> Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkPresetList(true)}
                    className={`px-3 py-1.5 text-xs rounded-r-md focus:z-10 focus:outline-none ${
                      currentBulkPreset
                        ? "bg-blue-50 text-blue-700 border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    } border`}
                  >
                    <i className="fa-solid fa-list-check mr-1"></i> Bulk
                  </button>
                </div>

                {!currentBulkPreset ? (
                  <>
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
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowBulkPresetList(true)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Change Preset
                  </button>
                )}
              </div>
            </div>

            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}

            {currentBulkPreset ? (
              // Bulk screenshot interface
              <div>
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Bulk Screenshot Settings</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentBulkPreset.items.length} URL
                        {currentBulkPreset.items.length !== 1 ? "s" : ""} •
                        Viewport: {currentBulkPreset.viewportWidth}×
                        {currentBulkPreset.viewportHeight}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkScreenshot}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-camera mr-2"></i>
                          Capture All Screenshots
                        </>
                      )}
                    </button>
                  </div>

                  {bulkResults.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Results</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {bulkResults.map((item, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              item.error
                                ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                                : item.result
                                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                                : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">
                                  {new URL(item.url).hostname}
                                </p>
                                {item.category && (
                                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {item.category}
                                    {item.subcategory
                                      ? `: ${item.subcategory}`
                                      : ""}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.selector}
                                </p>
                              </div>
                              <div>
                                {item.error ? (
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full dark:bg-red-900/40 dark:text-red-400">
                                    Error
                                  </span>
                                ) : item.result ? (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full dark:bg-green-900/40 dark:text-green-400">
                                    Success
                                  </span>
                                ) : isLoading ? (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/40 dark:text-blue-400">
                                    Processing...
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-400">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>

                            {item.error && (
                              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                {item.error}
                              </p>
                            )}

                            {item.result && (
                              <div className="mt-2">
                                <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex justify-center p-2">
                                  <img
                                    src={item.result.screenshotUrl}
                                    alt={`Screenshot of ${item.selector}`}
                                    className="object-contain"
                                    style={{
                                      maxHeight: "150px",
                                      maxWidth: "100%",
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between mt-2">
                                  <span className="text-xs text-gray-500">
                                    {item.result.width}×{item.result.height}
                                  </span>
                                  <button
                                    onClick={() =>
                                      window.open(
                                        item.result?.screenshotUrl,
                                        "_blank"
                                      )
                                    }
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <i className="fa-solid fa-arrow-up-right-from-square mr-1"></i>{" "}
                                    View Full Size
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Single screenshot interface
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
            )}
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
