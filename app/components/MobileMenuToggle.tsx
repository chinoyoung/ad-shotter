"use client";

import { useState } from "react";

export default function MobileMenuToggle({
  onToggle,
}: {
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 focus:outline-none"
      aria-label="Toggle menu"
    >
      <i className="fa-solid fa-bars text-base"></i>
    </button>
  );
}
