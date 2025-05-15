"use client";

import { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import ChartCard from "../components/ChartCard";
import ActivityCard from "../components/ActivityCard";
import { getScreenshotActivities } from "@/lib/activityService";
import { getAllPresets } from "@/lib/presetService";
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

        // Get presets
        const presets = await getAllPresets();

        // Get ad types (categories)
        const adTypesCount = Object.keys(PresetCategories).length;

        // Calculate growth percentages (for a real app, you'd compare with previous periods)
        // For this example, we'll use static values

        // Update stats
        setStats({
          totalScreenshots: screenshots.length,
          totalPresets: presets.length,
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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
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
          value="12"
          change="2"
          trend="up"
          color="purple"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Screenshot Activity"
            subtitle="Showing daily screenshot activity over time"
          />
        </div>
        <div>
          <ActivityCard />
        </div>
      </div>

      {/* Projects Table */}
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
              <tr className="text-xs text-gray-800 dark:text-gray-300">
                <td className="px-3 py-2">Website Redesign</td>
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5">
                      <div
                        className="bg-blue-500 h-1.5"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <span className="ml-1.5 text-xs font-medium">75%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                </td>
                <td className="px-3 py-2">May 25, 2025</td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                      JD
                    </div>
                    <div className="w-5 h-5 bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      AS
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="text-xs text-gray-800 dark:text-gray-300">
                <td className="px-3 py-2">Mobile App Development</td>
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5">
                      <div
                        className="bg-blue-500 h-1.5"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                    <span className="ml-1.5 text-xs font-medium">45%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                    In Progress
                  </span>
                </td>
                <td className="px-4 py-3">June 15, 2025</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                      RJ
                    </div>
                    <div className="w-5 h-5 bg-orange-500 flex items-center justify-center text-white text-xs font-medium">
                      ML
                    </div>
                    <div className="w-5 h-5 bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                      TD
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="text-sm text-gray-800 dark:text-gray-300">
                <td className="px-4 py-3">Marketing Campaign</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
                      <div
                        className="bg-blue-500 h-2"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">90%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3">May 20, 2025</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                      JD
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="text-sm text-gray-800 dark:text-gray-300">
                <td className="px-4 py-3">Database Migration</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
                      <div
                        className="bg-blue-500 h-2"
                        style={{ width: "30%" }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">30%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                    In Progress
                  </span>
                </td>
                <td className="px-4 py-3">July 5, 2025</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      AS
                    </div>
                    <div className="w-5 h-5 bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                      TD
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
