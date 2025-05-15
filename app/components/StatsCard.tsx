import { ReactNode } from "react";

interface CardProps {
  title: string;
  icon: ReactNode;
  value: string;
  change: string;
  trend: "up" | "down";
  color: "blue" | "green" | "indigo" | "purple" | "red" | "orange";
}

export default function StatsCard({
  title,
  icon,
  value,
  change,
  trend,
  color,
}: CardProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <div
          className={`w-8 h-8 ${colorClasses[color]} flex items-center rounded-full justify-center text-white text-sm`}
        >
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-semibold text-gray-800 dark:text-white">
          {value}
        </span>
        <div className="flex items-center mt-1">
          <span
            className={`text-xs font-medium ${
              trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend === "up" ? (
              <i className="fa-solid fa-arrow-up mr-1"></i>
            ) : (
              <i className="fa-solid fa-arrow-down mr-1"></i>
            )}
            {change}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            from last month
          </span>
        </div>
      </div>
    </div>
  );
}
