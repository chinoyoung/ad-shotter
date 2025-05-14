import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";

export default function PresetsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="pl-56 pt-6 w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="px-6 pb-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
