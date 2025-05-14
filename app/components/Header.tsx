"use client";

import MobileMenuToggle from "./MobileMenuToggle";

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar?: () => void;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-56 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 flex items-center justify-between px-3 lg:px-4 flatkit-shadow">
      <div className="flex items-center">
        {toggleSidebar && <MobileMenuToggle onToggle={toggleSidebar} />}

        <div className="lg:flex items-center ml-3 hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-gray-300"
            />{" "}
            <i className="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-xs"></i>
          </div>
        </div>
      </div>

      <div className="flex lg:hidden">
        <div className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-500 text-white font-bold text-sm">
          F
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
          <i className="fa-solid fa-bell text-base"></i>
          <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-red-500"></span>
        </button>

        <div className="hidden sm:flex items-center">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
            JD
          </div>
          <span className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            John Doe
          </span>
          <i className="fa-solid fa-chevron-down ml-1 text-xs text-gray-500 dark:text-gray-400"></i>
        </div>
      </div>
    </header>
  );
}
