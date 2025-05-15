"use client";

import { useEffect, useState } from "react";
import { getAllPresets, getAllBulkPresets } from "@/lib/presetService";
import { ScreenshotPreset, BulkScreenshotPreset } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface PresetItemProps {
  name: string;
  type: "single" | "bulk";
  category?: string;
  subcategory?: string;
  time: string;
  url: string;
  id: string;
  itemCount?: number;
  viewportSize: string;
  onEditClick: (id: string, type: "single" | "bulk") => void;
}

const PresetItem = ({
  name,
  type,
  category,
  subcategory,
  time,
  url,
  id,
  itemCount,
  viewportSize,
  onEditClick,
}: PresetItemProps) => {
  return (
    <div className="flex items-start mb-4 last:mb-0 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
      <div
        className={`w-8 h-8 ${
          type === "single" ? "bg-blue-500" : "bg-green-500"
        } rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0`}
      >
        <i
          className={`fa-solid ${
            type === "single" ? "fa-camera" : "fa-layer-group"
          }`}
        ></i>
      </div>

      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <p className="text-xs font-medium text-gray-800 dark:text-white">
            {name}
          </p>
          <button
            onClick={() => onEditClick(id, type)}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            Edit
          </button>
        </div>

        <div className="mt-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {type === "bulk"
              ? `${itemCount} items`
              : category
              ? `${category}${subcategory ? `: ${subcategory}` : ""}`
              : "No category"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {url.substring(0, 30)}
            {url.length > 30 ? "..." : ""} • {viewportSize}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

const formatTime = (timestamp: any): string => {
  if (!timestamp) return "Unknown time";

  try {
    // If timestamp is a number (milliseconds)
    if (typeof timestamp === "number") {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    }

    // Handle Date objects
    if (timestamp instanceof Date) {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    }

    // Handle Firebase Timestamp (with toDate method)
    if (timestamp.toDate) {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }

    return "Unknown time";
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Unknown time";
  }
};

export default function RecentPresetsCard() {
  const [presets, setPresets] = useState<
    (ScreenshotPreset | BulkScreenshotPreset)[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh presets
  const refreshPresets = async () => {
    try {
      setLoading(true);

      // Get both types of presets
      const [singlePresets, bulkPresets] = await Promise.all([
        getAllPresets(),
        getAllBulkPresets(),
      ]);

      // Add type property to distinguish between single and bulk presets
      const formattedSinglePresets = singlePresets.map((preset) => ({
        ...preset,
        presetType: "single" as const,
      }));

      const formattedBulkPresets = bulkPresets.map((preset) => ({
        ...preset,
        presetType: "bulk" as const,
      }));

      // Combine and sort by updatedAt (most recent first)
      const allPresets = [...formattedSinglePresets, ...formattedBulkPresets]
        .sort((a, b) => {
          const timeA = a.updatedAt
            ? typeof a.updatedAt === "number"
              ? a.updatedAt
              : new Date(a.updatedAt).getTime()
            : 0;
          const timeB = b.updatedAt
            ? typeof b.updatedAt === "number"
              ? b.updatedAt
              : new Date(b.updatedAt).getTime()
            : 0;
          return timeB - timeA;
        })
        .slice(0, 5); // Limit to 5 most recent

      setPresets(allPresets);
    } catch (error) {
      console.error("Error loading presets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle edit click
  const handleEditClick = (id: string, type: "single" | "bulk") => {
    // Redirect to the respective edit page
    const baseUrl = "/screenshot-tool";
    const queryParam = type === "single" ? "preset" : "bulkPreset";
    window.location.href = `${baseUrl}?${queryParam}=${id}`;
  };

  useEffect(() => {
    refreshPresets();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white">
          Recent Presets
        </h3>
        <button
          onClick={refreshPresets}
          className="text-blue-500 hover:text-blue-600 text-xs font-medium"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        </div>
      ) : presets.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="flex justify-center mb-3">
            <i className="fa-solid fa-layer-group text-3xl opacity-50"></i>
          </div>
          <p>No presets found</p>
        </div>
      ) : (
        <div className="space-y-1">
          {presets.map((preset) => (
            <PresetItem
              key={preset.id}
              id={preset.id!}
              name={preset.name}
              type={
                "presetType" in preset
                  ? (preset.presetType as "single" | "bulk")
                  : "single"
              }
              category={"category" in preset ? preset.category : undefined}
              subcategory={
                "subcategory" in preset ? preset.subcategory : undefined
              }
              time={formatTime(preset.updatedAt || preset.createdAt)}
              url={
                "url" in preset
                  ? preset.url
                  : "items" in preset && preset.items.length > 0
                  ? preset.items[0].url
                  : "No URL"
              }
              itemCount={"items" in preset ? preset.items.length : 0}
              viewportSize={`${preset.viewportWidth}×${preset.viewportHeight}`}
              onEditClick={handleEditClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
