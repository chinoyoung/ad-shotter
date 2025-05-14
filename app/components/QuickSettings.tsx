"use client";

import { useState, useEffect } from "react";

export default function QuickSettings() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    // On mount, get the theme from localStorage
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system"
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system
      setTheme("system");
      applyTheme("system");
    }
  }, []);

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    const isDarkMode =
      newTheme === "dark" ||
      (newTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", newTheme);
  };

  const changeTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <>
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        className="fixed bottom-3 right-3 w-8 h-8 bg-blue-500 text-white flex items-center justify-center shadow-lg z-50 hover:bg-blue-600 transition-colors"
        aria-label="Quick settings"
      >
        <i className="fa-solid fa-gear text-sm"></i>
      </button>

      {settingsOpen && (
        <div className="fixed bottom-12 right-3 w-56 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-3 z-50">
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

          <div className="mb-3">
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Theme
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => changeTheme("light")}
                className={`flex-1 px-2 py-1 text-xs rounded-sm ${
                  theme === "light"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => changeTheme("dark")}
                className={`flex-1 px-2 py-1 text-xs rounded-sm ${
                  theme === "dark"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => changeTheme("system")}
                className={`flex-1 px-2 py-1 text-xs rounded-sm ${
                  theme === "system"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p>Ad Shotter v1.0.0</p>
          </div>
        </div>
      )}
    </>
  );
}
