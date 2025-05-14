"use client";

import { useState, useEffect } from "react";
import { ScreenshotPreset, PresetCategories } from "@/lib/types";
import {
  getAllPresets,
  getPresetsByCategory,
  deletePreset,
} from "@/lib/presetService";
import Notification, { NotificationType } from "./Notification";

interface PresetListProps {
  onSelectPreset: (preset: ScreenshotPreset) => void;
  onEdit: (preset: ScreenshotPreset) => void;
  onCreateNew: () => void;
}

export default function PresetList({
  onSelectPreset,
  onEdit,
  onCreateNew,
}: PresetListProps) {
  const [presets, setPresets] = useState<ScreenshotPreset[]>([]);
  const [filteredPresets, setFilteredPresets] = useState<ScreenshotPreset[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
      const allPresets = await getAllPresets();
      setPresets(allPresets);
      applyFilters(allPresets, selectedCategory, searchTerm);
    } catch (err) {
      setError("Failed to load presets. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPresets();
  }, []);

  // Apply filters when category or search term changes
  const applyFilters = (
    allPresets: ScreenshotPreset[],
    category: string,
    search: string
  ) => {
    let filtered = [...allPresets];

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((preset) => preset.category === category);
    }

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (preset) =>
          preset.name.toLowerCase().includes(searchLower) ||
          preset.subcategory.toLowerCase().includes(searchLower) ||
          preset.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPresets(filtered);
  };

  // Update filters
  useEffect(() => {
    applyFilters(presets, selectedCategory, searchTerm);
  }, [selectedCategory, searchTerm, presets]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle preset deletion
  const handleDeletePreset = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this preset?")) {
      try {
        await deletePreset(id);
        setNotification({
          message: "Preset deleted successfully",
          type: "success",
        });
        loadPresets(); // Reload the presets after deletion
      } catch (err) {
        setError("Failed to delete preset. Please try again.");
        setNotification({
          message: "Failed to delete preset",
          type: "error",
        });
        console.error(err);
      }
    }
  };

  // Format date for display
  const formatDate = (timestamp: number | string | Date) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Ad Screenshot Presets</h2>
        <button
          onClick={onCreateNew}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New
        </button>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="category-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Filter by Category
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            {Object.values(PresetCategories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search Presets
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or description"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : filteredPresets.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchTerm || selectedCategory !== "all"
            ? "No presets match your filter criteria."
            : "No presets found. Create your first preset!"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ad Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPresets.map((preset) => (
                <tr
                  key={preset.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td
                    className="px-4 py-3 whitespace-nowrap cursor-pointer"
                    onClick={() => onSelectPreset(preset)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {preset.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                      {preset.description || "No description"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {preset.category.split(" ")[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {preset.subcategory}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(preset.updatedAt || preset.createdAt || "")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onSelectPreset(preset)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => onEdit(preset)}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset.id!)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
