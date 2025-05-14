"use client";

import { useState, useEffect } from "react";
import {
  ScreenshotPreset,
  PresetCategories,
  PresetSubcategories,
} from "@/lib/types";
import { createPreset, updatePreset } from "@/lib/presetService";
import Notification, { NotificationType } from "./Notification";

interface PresetFormProps {
  preset?: ScreenshotPreset;
  onSave: () => void;
  onCancel: () => void;
}

export default function PresetForm({
  preset,
  onSave,
  onCancel,
}: PresetFormProps) {
  const [name, setName] = useState(preset?.name || "");
  const [url, setUrl] = useState(preset?.url || "");
  const [selector, setSelector] = useState(preset?.selector || "");
  const [category, setCategory] = useState(
    preset?.category || Object.values(PresetCategories)[0]
  );
  const [subcategory, setSubcategory] = useState(preset?.subcategory || "");
  const [viewportWidth, setViewportWidth] = useState(
    preset?.viewportWidth || 1280
  );
  const [viewportHeight, setViewportHeight] = useState(
    preset?.viewportHeight || 800
  );
  const [description, setDescription] = useState(preset?.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Update subcategories when category changes
  useEffect(() => {
    if (category && PresetSubcategories[category]?.length > 0) {
      setSubcategory(PresetSubcategories[category][0]);
    } else {
      setSubcategory("");
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const presetData: Omit<ScreenshotPreset, "id"> = {
        name,
        url,
        selector,
        category,
        subcategory,
        viewportWidth,
        viewportHeight,
        description,
      };

      if (preset?.id) {
        await updatePreset(preset.id, presetData);
        setNotification({
          message: "Preset updated successfully",
          type: "success",
        });
      } else {
        await createPreset(presetData);
        setNotification({
          message: "Preset created successfully",
          type: "success",
        });
      }

      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      setError("Failed to save preset. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">
        {preset?.id ? "Edit Screenshot Preset" : "Create New Screenshot Preset"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

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
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Preset Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ad Type Name"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {Object.values(PresetCategories).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="subcategory"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Ad Type
          </label>
          <select
            id="subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {category &&
              PresetSubcategories[category]?.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
          </select>
        </div>

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
              htmlFor="viewportWidth"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Viewport Width
            </label>
            <input
              type="number"
              id="viewportWidth"
              value={viewportWidth}
              onChange={(e) => setViewportWidth(parseInt(e.target.value))}
              min="320"
              max="2560"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="viewportHeight"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Viewport Height
            </label>
            <input
              type="number"
              id="viewportHeight"
              value={viewportHeight}
              onChange={(e) => setViewportHeight(parseInt(e.target.value))}
              min="320"
              max="2560"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Enter any notes or description for this preset"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Preset"}
          </button>
        </div>
      </form>
    </div>
  );
}
