"use client";

import { useState, useEffect } from "react";
import { BulkScreenshotPreset } from "@/lib/types";
import { getAllBulkPresets, deleteBulkPreset } from "@/lib/presetService";
import Notification, { NotificationType } from "./Notification";

interface BulkPresetListProps {
  onSelectPreset: (preset: BulkScreenshotPreset) => void;
  onEdit: (preset: BulkScreenshotPreset) => void;
  onCreateNew: () => void;
}

export default function BulkPresetList({
  onSelectPreset,
  onEdit,
  onCreateNew,
}: BulkPresetListProps) {
  const [presets, setPresets] = useState<BulkScreenshotPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Load presets
  const loadPresets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allPresets = await getAllBulkPresets();
      setPresets(allPresets);
    } catch (error) {
      console.error("Error loading bulk presets:", error);
      setError("Failed to load bulk presets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  // Filter presets by search term
  const filteredPresets = presets.filter((preset) =>
    preset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete a preset
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this preset?")) {
      try {
        await deleteBulkPreset(id);
        setNotification({
          message: "Bulk preset deleted successfully!",
          type: "success",
        });
        loadPresets();
      } catch (error) {
        console.error("Error deleting preset:", error);
        setNotification({
          message: "Failed to delete preset. Please try again.",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Bulk Screenshot Presets</h2>
        <button
          onClick={onCreateNew}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i className="fa-solid fa-plus mr-1"></i> New Bulk Preset
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fa-solid fa-search text-gray-400"></i>
          </div>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
            placeholder="Search presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={loadPresets}
            className="mt-2 text-sm text-red-700 dark:text-red-400 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        </div>
      ) : filteredPresets.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-list-check text-gray-400 dark:text-gray-500 text-xl"></i>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {searchTerm
              ? "No matching presets found"
              : "No bulk screenshot presets yet"}
          </p>
          <button
            onClick={onCreateNew}
            className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Create your first preset
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="mb-2 md:mb-0">
                  <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-1">
                    {preset.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {preset.items.length} URL
                    {preset.items.length !== 1 ? "s" : ""} • Viewport:{" "}
                    {preset.viewportWidth}×{preset.viewportHeight}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectPreset(preset)}
                    className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <i className="fa-solid fa-camera mr-1"></i> Use
                  </button>
                  <button
                    onClick={() => onEdit(preset)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    <i className="fa-solid fa-pen-to-square mr-1"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(preset.id as string)}
                    className="px-3 py-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <i className="fa-solid fa-trash-can mr-1"></i> Delete
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  URLs in this preset:
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {preset.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded"
                    >
                      <span className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded px-1.5 py-0.5 mr-2">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.url}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2 font-mono">
                          {item.selector}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
