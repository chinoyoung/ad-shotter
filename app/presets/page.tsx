"use client";

import { useState } from "react";
import { ScreenshotPreset } from "@/lib/types";
import PresetForm from "@/components/PresetForm";
import PresetList from "@/components/PresetList";

export default function PresetsPage() {
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<
    ScreenshotPreset | undefined
  >(undefined);

  const handleCreateNewPreset = () => {
    setCurrentPreset(undefined);
    setShowPresetForm(true);
  };

  const handleEditPreset = (preset: ScreenshotPreset) => {
    setCurrentPreset(preset);
    setShowPresetForm(true);
  };

  const handleSavePreset = () => {
    setShowPresetForm(false);
    setCurrentPreset(undefined);
  };

  const handleUsePreset = (preset: ScreenshotPreset) => {
    // Redirect to screenshot tool with this preset
    window.location.href = `/screenshot-tool?preset=${preset.id}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Manage Ad Screenshot Presets
        </h1>
        <button
          onClick={handleCreateNewPreset}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium flex items-center"
        >
          <i className="fa-solid fa-plus mr-1.5"></i>
          Create New Preset
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {showPresetForm ? (
          <PresetForm
            preset={currentPreset}
            onSave={handleSavePreset}
            onCancel={() => setShowPresetForm(false)}
          />
        ) : (
          <PresetList
            onSelectPreset={handleUsePreset}
            onEdit={handleEditPreset}
            onCreateNew={handleCreateNewPreset}
          />
        )}
      </div>
    </div>
  );
}
