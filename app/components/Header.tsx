"use client";

import MobileMenuToggle from "./MobileMenuToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar?: () => void;
}) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-56 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 flex items-center justify-between px-3 lg:px-4 flatkit-shadow">
      <div className="flex items-center">
        {toggleSidebar && <MobileMenuToggle onToggle={toggleSidebar} />}

        <div className="lg:flex items-center ml-3 hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-gray-300"
            />{" "}
            <i className="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-xs"></i>
          </div>
        </div>
      </div>

      <div className="flex lg:hidden">
        <div className="flex items-center justify-center h-6 w-6 bg-blue-500 text-white font-bold text-sm">
          F
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
          <i className="fa-solid fa-bell text-base"></i>
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-500 flex items-center justify-center rounded-full text-white text-xs font-medium">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
            {user?.displayName || user?.email?.split("@")[0] || "User"}
          </span>
          <button
            onClick={handleSignOut}
            className="ml-3 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
