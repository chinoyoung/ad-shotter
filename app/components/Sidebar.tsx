import Link from "next/link";
import { ReactNode } from "react";

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({
  icon,
  text,
  href,
  active = false,
}: SidebarItemProps) => {
  return (
    <li
      className={`mb-0.5 ${
        active
          ? "bg-blue-500 text-white"
          : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
      }`}
    >
      <Link
        href={href}
        className={`flex items-center px-3 py-2 text-xs transition-colors ${
          active ? "" : "text-gray-600 dark:text-gray-300"
        }`}
      >
        <span className="mr-2 text-base">{icon}</span>
        <span>{text}</span>
      </Link>
    </li>
  );
};

export default function Sidebar({ isOpen = true }: { isOpen?: boolean }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm z-40 transition-all duration-300`}
    >
      <div className="py-3 px-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white font-bold text-base">
            AS
          </div>
          <span className="ml-2 font-medium text-base text-gray-800 dark:text-white">
            Ad Shotter
          </span>
        </div>
      </div>

      <div className="p-4">
        <ul>
          <SidebarItem
            icon={<i className="fa-solid fa-house"></i>}
            text="Dashboard"
            href="/dashboard"
            active={true}
          />
          <SidebarItem
            icon={<i className="fa-solid fa-chart-line"></i>}
            text="Analytics"
            href="/analytics"
          />
          <SidebarItem
            icon={<i className="fa-solid fa-calendar"></i>}
            text="Calendar"
            href="/calendar"
          />
          <SidebarItem
            icon={<i className="fa-solid fa-envelope"></i>}
            text="Inbox"
            href="/inbox"
          />
          <SidebarItem
            icon={<i className="fa-solid fa-gear"></i>}
            text="Settings"
            href="/settings"
          />
        </ul>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            Recent Projects
          </h3>
          <ul>
            <SidebarItem
              icon={<i className="fa-solid fa-folder"></i>}
              text="Website Redesign"
              href="/projects/1"
            />
            <SidebarItem
              icon={<i className="fa-solid fa-folder"></i>}
              text="Mobile App"
              href="/projects/2"
            />
          </ul>
        </div>
      </div>
    </aside>
  );
}
