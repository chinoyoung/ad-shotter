import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageInfo } from "@/lib/screenshot";
import { getScreenshotActivities, ActivityItem } from "@/lib/activityService";

export interface ScreenshotHistoryItem {
  id: string;
  timestamp: number;
  url: string;
  selector: string;
  viewportWidth: number;
  viewportHeight: number;
  screenshotUrl: string;
  width: number;
  height: number;
  cloudinaryId?: string;
}

export default function ScreenshotHistory() {
  const [history, setHistory] = useState<ScreenshotHistoryItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [loading, setLoading] = useState(true);

  // Function to load screenshot history from Firestore
  const loadScreenshotHistory = async () => {
    try {
      setLoading(true);
      const activities = await getScreenshotActivities(20);

      // Convert ActivityItem to ScreenshotHistoryItem
      const convertedHistory: ScreenshotHistoryItem[] = activities.map(
        (activity) => {
          const timestamp = activity.timestamp?.toDate?.()
            ? activity.timestamp.toDate().getTime()
            : Date.now();

          return {
            id: activity.id,
            timestamp: timestamp,
            url: activity.details?.url || "",
            selector: activity.details?.selector || "",
            viewportWidth: activity.details?.viewportWidth || 1280,
            viewportHeight: activity.details?.viewportHeight || 800,
            screenshotUrl: activity.details?.screenshotUrl || "",
            width: activity.details?.width || 0,
            height: activity.details?.height || 0,
          };
        }
      );

      setHistory(convertedHistory);
    } catch (error) {
      console.error("Failed to load screenshot history from Firestore", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load history from Firestore on component mount
    loadScreenshotHistory();

    // Set up event listener for new screenshots
    const handleScreenshotTaken = () => {
      loadScreenshotHistory();
    };

    window.addEventListener("screenshot-taken", handleScreenshotTaken);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("screenshot-taken", handleScreenshotTaken);
    };
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleItemExpansion = (id: string) => {
    if (expandedItem === id) {
      setExpandedItem(null);
    } else {
      setExpandedItem(id);
    }
  };

  const clearHistory = () => {
    if (
      window.confirm("Are you sure you want to clear your screenshot history?")
    ) {
      // We only clear the local display since we can't delete from Firestore easily
      // A more complete implementation would include Firestore deletion with proper permissions
      setHistory([]);
    }
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Screenshot URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Screenshot History</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          {loading ? (
            <div className="py-10 flex justify-center items-center">
              <div className="w-8 h-8 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <i className="fa-solid fa-camera text-gray-400 dark:text-gray-500 text-xl"></i>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No screenshots in history yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md">
                Capture a screenshot using the form above to see it here.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Screenshot History</h2>

        <div className="flex space-x-2 mt-2 sm:mt-0">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs rounded-l-md focus:z-10 focus:outline-none ${
                viewMode === "list"
                  ? "bg-blue-50 text-blue-700 border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              } border`}
            >
              <i className="fa-solid fa-list mr-1"></i> List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs rounded-r-md focus:z-10 focus:outline-none ${
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-700 border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              } border`}
            >
              <i className="fa-solid fa-grip mr-1"></i> Grid
            </button>
          </div>

          <button
            onClick={loadScreenshotHistory}
            className="px-3 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-1 focus:ring-blue-500 mr-2"
          >
            <i className="fa-solid fa-refresh mr-1"></i> Refresh
          </button>

          <button
            onClick={clearHistory}
            className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-md hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <i className="fa-solid fa-trash-can mr-1"></i> Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-[300px] flex items-center">
                    <i className="fa-solid fa-globe text-gray-400 mr-2 text-xs"></i>
                    {new URL(item.url).hostname}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    <i className="fa-regular fa-clock mr-1"></i>{" "}
                    {formatDate(item.timestamp)}
                  </p>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                      {item.selector}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <i className="fa-solid fa-ruler-combined"></i>
                      {item.width}×{item.height}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <span className="inline-flex items-center">
                    <i className="fa-solid fa-desktop mr-1.5 w-4 text-center"></i>
                    Viewport: {item.viewportWidth}×{item.viewportHeight}
                  </span>
                  <button
                    onClick={() => toggleItemExpansion(item.id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center mt-2"
                  >
                    {expandedItem === item.id ? (
                      <>
                        <i className="fa-solid fa-chevron-up mr-1"></i> Less
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-chevron-down mr-1"></i> More
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  expandedItem === item.id
                    ? "max-h-[600px] opacity-100"
                    : "max-h-[200px] opacity-100"
                }`}
              >
                <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex justify-center">
                  <img
                    src={item.screenshotUrl}
                    alt={`Screenshot of ${item.selector}`}
                    className="object-contain"
                    style={{
                      maxHeight: expandedItem === item.id ? "500px" : "200px",
                      maxWidth: "100%",
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-3 gap-2">
                <button
                  onClick={() => copyImageUrl(item.screenshotUrl)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <i className="fa-regular fa-clipboard mr-1"></i> Copy URL
                </button>
                <button
                  onClick={() => window.open(item.screenshotUrl, "_blank")}
                  className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square mr-1"></i>{" "}
                  Full Size
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center">
                <img
                  src={item.screenshotUrl}
                  alt={`Screenshot of ${item.selector}`}
                  className="object-contain w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2 truncate">
                  {item.selector}
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] text-sm">
                    {new URL(item.url).hostname}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(item.timestamp).split(",")[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.width}×{item.height}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyImageUrl(item.screenshotUrl)}
                      className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Copy URL"
                    >
                      <i className="fa-regular fa-clipboard"></i>
                    </button>
                    <button
                      onClick={() => window.open(item.screenshotUrl, "_blank")}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Full Size"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
