interface ChartCardProps {
  title: string;
  subtitle: string;
}

export default function ChartCard({ title, subtitle }: ChartCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="flex space-x-1">
          <button className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            Day
          </button>
          <button className="px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            Week
          </button>
          <button className="px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            Month
          </button>
        </div>
      </div>

      {/* Chart placeholder - in a real app you would use a chart library */}
      <div className="h-56 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-400 dark:text-gray-500 text-xs">
          Chart Placeholder - Would use a library like Chart.js or Recharts
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-3">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Visitors
          </div>
          <div className="mt-0.5 text-base font-semibold text-gray-800 dark:text-white">
            24.5k
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Orders
          </div>
          <div className="mt-0.5 text-base font-semibold text-gray-800 dark:text-white">
            1.8k
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Sales
          </div>
          <div className="mt-0.5 text-base font-semibold text-gray-800 dark:text-white">
            $12.9k
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Conversion
          </div>
          <div className="mt-0.5 text-base font-semibold text-gray-800 dark:text-white">
            7.3%
          </div>
        </div>
      </div>
    </div>
  );
}
