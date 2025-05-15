"use client";

import { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import ActivityCard from "../components/ActivityCard";
import RecentPresetsCard from "../components/RecentPresetsCard";
import { getScreenshotActivities } from "@/lib/activityService";
import { getAllPresets, getAllBulkPresets } from "@/lib/presetService";
import { PresetCategories } from "@/lib/types";

interface DashboardStats {
  totalScreenshots: number;
  totalPresets: number;
  totalAdTypes: number;
  screenshotGrowth: number;
  presetGrowth: number;
  adTypeGrowth: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalScreenshots: 0,
    totalPresets: 0,
    totalAdTypes: 0,
    screenshotGrowth: 12,
    presetGrowth: 8,
    adTypeGrowth: 2,
  });

  const [recentScreenshots, setRecentScreenshots] = useState<any[]>([]);

  // Fetch all the dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Get screenshots
        const screenshots = await getScreenshotActivities(50);

        // Get presets and bulk presets
        const [presets, bulkPresets] = await Promise.all([
          getAllPresets(),
          getAllBulkPresets(),
        ]);

        // Get ad types (categories)
        const adTypesCount = Object.keys(PresetCategories).length;

        // Calculate growth percentages (for a real app, you'd compare with previous periods)
        // For this example, we'll use static values

        // Update stats
        setStats({
          totalScreenshots: screenshots.length,
          totalPresets: presets.length + bulkPresets.length,
          totalAdTypes: adTypesCount,
          screenshotGrowth: 12, // Example value
          presetGrowth: 8, // Example value
          adTypeGrowth: 2, // Example value
        });

        // Get recent screenshots for the table
        const recent = screenshots.slice(0, 5).map((screenshot) => {
          return {
            id: screenshot.id,
            website: new URL(screenshot.details?.url || "https://example.com")
              .hostname,
            screenshotType: screenshot.details?.selector || "Unknown",
            status: "Completed",
            date: screenshot.timestamp?.toDate
              ? new Date(screenshot.timestamp.toDate()).toLocaleDateString()
              : new Date().toLocaleDateString(),
            user: screenshot.userEmail?.split("@")[0] || "Anonymous",
          };
        });

        setRecentScreenshots(recent);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium flex items-center">
          <i className="fa-solid fa-camera mr-1.5"></i>
          New Screenshot
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Screenshots"
          icon={<i className="fa-solid fa-camera"></i>}
          value={loading ? "Loading..." : formatNumber(stats.totalScreenshots)}
          change={`${stats.screenshotGrowth}%`}
          trend="up"
          color="blue"
        />
        <StatsCard
          title="Total Presets"
          icon={<i className="fa-solid fa-layer-group"></i>}
          value={loading ? "Loading..." : formatNumber(stats.totalPresets)}
          change={`${stats.presetGrowth}%`}
          trend="up"
          color="green"
        />
        <StatsCard
          title="Total Ad Types"
          icon={<i className="fa-solid fa-tag"></i>}
          value={loading ? "Loading..." : formatNumber(stats.totalAdTypes)}
          change={`${stats.adTypeGrowth}`}
          trend="up"
          color="purple"
        />
      </div>

      {/* Presets and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentPresetsCard />
        </div>
        <div>
          <ActivityCard />
        </div>
      </div>

      {/* Screenshots Table */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-white">
            Recent Screenshots
          </h3>
          <div className="flex items-center space-x-1.5">
            <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <i className="fa-solid fa-filter text-xs"></i>
            </button>
            <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 flex justify-center items-center">
              <div className="w-8 h-8 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>
          ) : recentScreenshots.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No screenshots found
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="px-3 py-2">Website</th>
                  <th className="px-3 py-2">Screenshot Type</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Created by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {recentScreenshots.map((screenshot) => (
                  <tr
                    key={screenshot.id}
                    className="text-xs text-gray-800 dark:text-gray-300"
                  >
                    <td className="px-3 py-2">{screenshot.website}</td>
                    <td className="px-3 py-2">
                      <div className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                        {screenshot.screenshotType}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        {screenshot.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{screenshot.date}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {screenshot.user.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
