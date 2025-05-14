"use client";

import { useEffect, useState } from "react";
import { getRecentActivities, ActivityItem } from "@/lib/activityService";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  avatar?: string;
  initials?: string;
  name: string;
  action: string;
  time: string;
  iconColor?: string;
  targetUrl?: string;
}

const ActivityItemComponent = ({
  avatar,
  initials,
  name,
  action,
  time,
  iconColor = "bg-blue-500",
  targetUrl,
}: ActivityItemProps) => {
  const targetLink = targetUrl ? (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-600 hover:underline"
    >
      View
    </a>
  ) : null;

  return (
    <div className="flex items-start mb-4 last:mb-0">
      <div
        className={`w-8 h-8 ${iconColor} rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0`}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-xs text-gray-800 dark:text-white">
          <span className="font-medium">{name}</span> {action} {targetLink}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
      </div>
    </div>
  );
};

const getIconColorByAction = (action: string): string => {
  // Map actions to colors
  const actionColors: Record<string, string> = {
    "took a screenshot": "bg-blue-500",
    "created a preset": "bg-green-500",
    "updated a preset": "bg-purple-500",
    "deleted a preset": "bg-red-500",
    "logged in": "bg-indigo-500",
  };

  // Find matching action or fallback to default
  for (const [actionKey, color] of Object.entries(actionColors)) {
    if (action.includes(actionKey)) {
      return color;
    }
  }

  return "bg-gray-500";
};

const getUserInitials = (name: string | null): string => {
  if (!name) return "?";

  const parts = name.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatActivityTime = (timestamp: any): string => {
  if (!timestamp) return "Just now";

  try {
    // Convert Firebase timestamp to JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Unknown time";
  }
};

export default function ActivityCard() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh activities
  const refreshActivities = async () => {
    try {
      setLoading(true);
      const recentActivities = await getRecentActivities(5);

      // Sort activities by timestamp to ensure most recent first
      const sortedActivities = recentActivities.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;

        // Safely get timestamps as milliseconds
        let timeA = 0;
        let timeB = 0;

        try {
          timeA = a.timestamp.toDate
            ? a.timestamp.toDate().getTime()
            : new Date(a.timestamp).getTime();
        } catch (e) {
          console.error("Error converting timestamp A", e);
        }

        try {
          timeB = b.timestamp.toDate
            ? b.timestamp.toDate().getTime()
            : new Date(b.timestamp).getTime();
        } catch (e) {
          console.error("Error converting timestamp B", e);
        }

        return timeB - timeA;
      });

      setActivities(sortedActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActivities();

    // Set up real-time refresh every 30 seconds
    const intervalId = setInterval(() => {
      refreshActivities();
    }, 30000); // 30 seconds

    // Set up event listener for new screenshots
    const handleScreenshotTaken = () => {
      refreshActivities();
    };

    window.addEventListener("screenshot-taken", handleScreenshotTaken);

    // Clean up interval and event listener on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("screenshot-taken", handleScreenshotTaken);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white">
          Recent Activity
        </h3>
        <button
          onClick={refreshActivities}
          className="text-blue-500 hover:text-blue-600 text-xs font-medium"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="flex justify-center mb-3">
            <i className="fa-solid fa-clock text-3xl opacity-50"></i>
          </div>
          <p>No recent activities found</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <ActivityItemComponent
              key={activity.id}
              avatar={activity.userPhotoURL || undefined}
              initials={getUserInitials(activity.userName)}
              name={activity.userName || activity.userEmail.split("@")[0]}
              action={activity.action}
              time={formatActivityTime(activity.timestamp)}
              iconColor={getIconColorByAction(activity.action)}
              targetUrl={
                activity.targetType === "screenshot"
                  ? activity.details?.screenshotUrl
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
