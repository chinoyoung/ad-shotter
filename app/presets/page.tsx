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
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Ad Screenshot Presets</h1>

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
  );
}
