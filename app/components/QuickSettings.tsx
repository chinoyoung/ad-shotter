"use client";

import { useState } from "react";

export default function QuickSettings() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        className="fixed bottom-3 right-3 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg z-50 hover:bg-blue-600 transition-colors"
        aria-label="Quick settings"
      >
        <i className="fa-solid fa-gear text-sm"></i>
      </button>

      {settingsOpen && (
        <div className="fixed bottom-12 right-3 w-56 bg-white dark:bg-gray-900 rounded-md shadow-xl border border-gray-200 dark:border-gray-800 p-3 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-medium text-gray-800 dark:text-white">
              Settings
            </h3>
            <button
              onClick={() => setSettingsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i className="fa-solid fa-times text-xs"></i>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Dark Mode
              </span>
              <button className="w-10 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center transition-colors relative focus:outline-none">
                <span
                  className={`w-4 h-4 rounded-full transform transition-transform bg-white dark:bg-blue-500 shadow-sm absolute ${
                    document?.documentElement?.classList.contains("dark")
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Compact Sidebar
              </span>
              <button className="w-10 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center transition-colors relative focus:outline-none">
                <span className="w-4 h-4 rounded-full transform transition-transform bg-white shadow-sm absolute translate-x-0.5"></span>
              </button>
            </div>

            <div>
              <span className="text-xs text-gray-600 dark:text-gray-300 block mb-1">
                Theme Color
              </span>
              <div className="flex space-x-1.5">
                <button className="w-5 h-5 rounded-full bg-blue-500 hover:ring-1 hover:ring-offset-1 hover:ring-blue-500 focus:outline-none"></button>
                <button className="w-5 h-5 rounded-full bg-indigo-500 hover:ring-1 hover:ring-offset-1 hover:ring-indigo-500 focus:outline-none"></button>
                <button className="w-5 h-5 rounded-full bg-purple-500 hover:ring-1 hover:ring-offset-1 hover:ring-purple-500 focus:outline-none"></button>
                <button className="w-5 h-5 rounded-full bg-green-500 hover:ring-1 hover:ring-offset-1 hover:ring-green-500 focus:outline-none"></button>
                <button className="w-5 h-5 rounded-full bg-red-500 hover:ring-1 hover:ring-offset-1 hover:ring-red-500 focus:outline-none"></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
