"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import QuickSettings from "../components/QuickSettings";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar isOpen={sidebarOpen} />
        <Header toggleSidebar={toggleSidebar} />
        <main className="pt-20 px-3 lg:px-4 py-4 lg:ml-56 transition-all duration-300">
          <div
            className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${
              sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleSidebar}
          />
          {children}
        </main>
        <QuickSettings />
      </div>
    </AuthGuard>
  );
}
