"use client";

import { useState, useEffect } from "react";
import {
  BulkScreenshotPreset,
  BulkScreenshotItem,
  PresetCategories,
  PresetSubcategories,
} from "@/lib/types";
import { createBulkPreset, updateBulkPreset } from "@/lib/presetService";
import Notification, { NotificationType } from "./Notification";

interface BulkPresetFormProps {
  preset?: BulkScreenshotPreset;
  onSave: () => void;
  onCancel: () => void;
}

export default function BulkPresetForm({
  preset,
  onSave,
  onCancel,
}: BulkPresetFormProps) {
  const [name, setName] = useState(preset?.name || "");
  const [items, setItems] = useState<BulkScreenshotItem[]>(
    preset?.items || [{ url: "", selector: "", category: "", subcategory: "" }]
  );
  const [viewportWidth, setViewportWidth] = useState(
    preset?.viewportWidth || 1280
  );
  const [viewportHeight, setViewportHeight] = useState(
    preset?.viewportHeight || 800
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Add a new item to the list
  const addItem = () => {
    setItems([
      ...items,
      { url: "", selector: "", category: "", subcategory: "" },
    ]);
  };

  // Remove an item from the list
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Update an item's property
  const updateItem = (
    index: number,
    field: keyof BulkScreenshotItem,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate form
    if (!name) {
      setError("Preset name is required");
      setIsLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("At least one URL is required");
      setIsLoading(false);
      return;
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.url || !item.selector) {
        setError(
          `URL and selector are required for all items (Item #${i + 1})`
        );
        setIsLoading(false);
        return;
      }
    }

    // Create or update preset
    try {
      const bulkPreset: BulkScreenshotPreset = {
        name,
        items,
        viewportWidth,
        viewportHeight,
      };

      if (preset?.id) {
        bulkPreset.id = preset.id;
        await updateBulkPreset(bulkPreset);
        setNotification({
          message: "Bulk screenshot preset updated successfully!",
          type: "success",
        });
      } else {
        await createBulkPreset(bulkPreset);
        setNotification({
          message: "Bulk screenshot preset created successfully!",
          type: "success",
        });
      }

      // Call the onSave callback
      onSave();
    } catch (error) {
      console.error("Error saving bulk preset:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save preset. Please try again."
      );
    } finally {
      setIsLoading(false);
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          {preset?.id
            ? "Edit Bulk Screenshot Preset"
            : "Create Bulk Screenshot Preset"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Preset Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
            placeholder="My Bulk Screenshot Preset"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Viewport Size
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="viewportWidth"
                className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
              >
                Width (px)
              </label>
              <input
                type="number"
                id="viewportWidth"
                value={viewportWidth}
                onChange={(e) => setViewportWidth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                min="320"
                max="3840"
                required
              />
            </div>
            <div>
              <label
                htmlFor="viewportHeight"
                className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
              >
                Height (px)
              </label>
              <input
                type="number"
                id="viewportHeight"
                value={viewportHeight}
                onChange={(e) => setViewportHeight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                min="320"
                max="2160"
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URLs and Selectors *
            </label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <i className="fa-solid fa-plus mr-1"></i> Add URL
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Item #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className={`text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${
                    items.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <i className="fa-solid fa-trash-can mr-1"></i> Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-3">
                <div>
                  <label
                    htmlFor={`url-${index}`}
                    className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                  >
                    URL *
                  </label>
                  <input
                    type="url"
                    id={`url-${index}`}
                    value={item.url}
                    onChange={(e) => updateItem(index, "url", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor={`selector-${index}`}
                    className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                  >
                    CSS Selector *
                  </label>
                  <input
                    type="text"
                    id={`selector-${index}`}
                    value={item.selector}
                    onChange={(e) =>
                      updateItem(index, "selector", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="#main-content .ad-container"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`category-${index}`}
                    className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id={`category-${index}`}
                    value={item.category || ""}
                    onChange={(e) =>
                      updateItem(index, "category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {Object.values(PresetCategories).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`subcategory-${index}`}
                    className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                  >
                    Subcategory
                  </label>
                  <select
                    id={`subcategory-${index}`}
                    value={item.subcategory || ""}
                    onChange={(e) =>
                      updateItem(index, "subcategory", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                    disabled={!item.category}
                  >
                    <option value="">Select subcategory</option>
                    {item.category &&
                      PresetSubcategories[item.category]?.map((subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                {preset?.id ? "Updating..." : "Creating..."}
              </>
            ) : preset?.id ? (
              "Update Preset"
            ) : (
              "Create Preset"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
