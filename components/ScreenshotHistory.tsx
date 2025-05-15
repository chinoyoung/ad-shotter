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
  images?: ImageInfo[];
}

export default function ScreenshotHistory() {
  const [history, setHistory] = useState<ScreenshotHistoryItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [loading, setLoading] = useState(true);
  // Add error state for displaying user-friendly messages
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(9); // Default 9 items per page

  // Function to load screenshot history from Firestore
  const loadScreenshotHistory = async () => {
    try {
      setLoading(true);
      const activities = await getScreenshotActivities(50); // Fetch more items for pagination
      setTotalItems(activities.length);

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
            cloudinaryId: activity.details?.cloudinaryId,
            images: activity.details?.images || [],
          };
        }
      );

      setHistory(convertedHistory);
    } catch (error) {
      console.error("Failed to load screenshot history from Firestore", error);
      setError("Failed to load screenshot history. Please try again later.");
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

  // Calculate the current items to display based on pagination
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return history.slice(startIndex, endIndex);
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update items per page when view mode changes
  useEffect(() => {
    // Set more appropriate items per page for each view mode
    if (viewMode === "list") {
      setItemsPerPage(6); // Fewer items for list view since they take more space
    } else {
      setItemsPerPage(9); // More items for grid view
    }
    setCurrentPage(1); // Reset to first page when changing view mode
  }, [viewMode]);

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

  const deleteScreenshot = async (id: string, cloudinaryId?: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this screenshot? This action cannot be undone."
      )
    ) {
      try {
        setLoading(true);

        // Use the API endpoint to handle both Cloudinary and Firestore deletion
        const response = await fetch("/api/screenshot/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activityId: id,
            cloudinaryId: cloudinaryId || undefined,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Remove the deleted item from the local state
          setHistory(history.filter((item) => item.id !== id));
          setNotification({
            message: "Screenshot deleted successfully!",
            type: "success",
          });

          // Clear notification after 3 seconds
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        } else {
          setNotification({
            message: "Failed to delete the screenshot. Please try again.",
            type: "error",
          });

          // Clear notification after 5 seconds
          setTimeout(() => {
            setNotification(null);
          }, 5000);
        }
      } catch (err) {
        console.error("Error deleting screenshot:", err);
        setNotification({
          message: `Error: ${
            err instanceof Error ? err.message : "Unknown error occurred"
          }`,
          type: "error",
        });

        // Clear notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      } finally {
        setLoading(false);
      }
    }
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
        <div>
          <h2 className="text-lg font-semibold">Screenshot History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {history.length} total screenshots
          </p>
        </div>

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

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            className="px-2 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="6">6 per page</option>
            <option value="9">9 per page</option>
            <option value="12">12 per page</option>
            <option value="24">24 per page</option>
          </select>

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
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={loadScreenshotHistory}
            className="mt-4 px-3 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <i className="fa-solid fa-refresh mr-1"></i> Retry
          </button>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          {notification && (
            <div
              className={`mb-4 p-3 rounded-md ${
                notification.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                  : notification.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                  : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
              }`}
            >
              <div className="flex items-center">
                <i
                  className={`mr-2 ${
                    notification.type === "success"
                      ? "fa-solid fa-check-circle text-green-500 dark:text-green-400"
                      : notification.type === "error"
                      ? "fa-solid fa-exclamation-circle text-red-500 dark:text-red-400"
                      : "fa-solid fa-info-circle text-blue-500 dark:text-blue-400"
                  }`}
                ></i>
                <span>{notification.message}</span>
              </div>
            </div>
          )}
          {getCurrentItems().map((item) => (
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
                    ? "max-h-[700px] opacity-100"
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

                {expandedItem === item.id && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-xs space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Screenshot Details
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Dimensions:
                          </span>{" "}
                          <span className="font-mono">
                            {item.width}×{item.height}px
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Storage:
                          </span>{" "}
                          <span>
                            {item.cloudinaryId ? "Cloudinary" : "Local"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {item.images && item.images.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Images within Element ({item.images.length})
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {item.images.map((img, index) => (
                            <div
                              key={index}
                              className="p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden"
                                  style={{
                                    backgroundImage: `url(${img.src})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                />
                                <div className="truncate">
                                  <div className="font-medium truncate">
                                    {new URL(img.src).pathname.split("/").pop()}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400 truncate">
                                    {img.alt || "No alt text"}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Rendered:
                                  </span>{" "}
                                  <span className="font-mono">
                                    {img.renderedWidth}×{img.renderedHeight}px
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Intrinsic:
                                  </span>{" "}
                                  <span className="font-mono">
                                    {img.intrinsicWidth}×{img.intrinsicHeight}px
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Aspect Ratio:
                                  </span>{" "}
                                  <span className="font-mono">
                                    {img.aspectRatio}
                                  </span>
                                </div>
                                <div>
                                  <a
                                    href={img.src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <i className="fa-solid fa-external-link-alt mr-1"></i>{" "}
                                    View
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-3 gap-2">
                <button
                  onClick={() => deleteScreenshot(item.id, item.cloudinaryId)}
                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <i className="fa-solid fa-trash-can mr-1"></i> Delete
                </button>
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
          {notification && (
            <div
              className={`col-span-full mb-2 p-3 rounded-md ${
                notification.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                  : notification.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                  : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
              }`}
            >
              <div className="flex items-center">
                <i
                  className={`mr-2 ${
                    notification.type === "success"
                      ? "fa-solid fa-check-circle text-green-500 dark:text-green-400"
                      : notification.type === "error"
                      ? "fa-solid fa-exclamation-circle text-red-500 dark:text-red-400"
                      : "fa-solid fa-info-circle text-blue-500 dark:text-blue-400"
                  }`}
                ></i>
                <span>{notification.message}</span>
              </div>
            </div>
          )}
          {getCurrentItems().map((item) => (
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
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.width}×{item.height}
                    </span>
                    {item.images && item.images.length > 0 && (
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        <i className="fa-regular fa-image mr-1"></i>
                        {item.images.length}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        deleteScreenshot(item.id, item.cloudinaryId)
                      }
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Screenshot"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
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

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, history.length)} of{" "}
            {history.length} screenshots
          </p>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-label="Previous page"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;

              // Only show limited page buttons with ellipsis if there are many pages
              if (
                totalPages <= 7 ||
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-8 h-8 rounded-md ${
                      currentPage === pageNumber
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={
                      currentPage === pageNumber ? "page" : undefined
                    }
                  >
                    {pageNumber}
                  </button>
                );
              }

              // Show ellipsis to indicate skipped pages (only once for each gap)
              if (
                (pageNumber === 2 && currentPage > 3) ||
                (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              return null;
            })}

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-label="Next page"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
