"use client";

import { useState, useEffect } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
  message: string;
  type: NotificationType;
  duration?: number;
  onClose?: () => void;
}

export default function Notification({
  message,
  type,
  duration = 5000,
  onClose,
}: NotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!visible) return null;

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-700 dark:text-green-400";
      case "error":
        return "text-red-700 dark:text-red-400";
      case "warning":
        return "text-yellow-700 dark:text-yellow-400";
      case "info":
      default:
        return "text-blue-700 dark:text-blue-400";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <i className="fa-solid fa-check-circle mr-2" />;
      case "error":
        return <i className="fa-solid fa-times-circle mr-2" />;
      case "warning":
        return <i className="fa-solid fa-exclamation-triangle mr-2" />;
      case "info":
      default:
        return <i className="fa-solid fa-info-circle mr-2" />;
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border ${getBgColor()} shadow-md animate-fade-in-down`}
    >
      <div className={`flex items-center ${getTextColor()}`}>
        {getIcon()}
        <span>{message}</span>
      </div>
      <button
        onClick={handleClose}
        className={`ml-3 text-gray-400 hover:text-gray-500 focus:outline-none`}
      >
        <i className="fa-solid fa-times" />
      </button>
    </div>
  );
}

// Add a keyframes animation for fade-in-down in your globals.css
// @keyframes fadeInDown {
//   from {
//     opacity: 0;
//     transform: translate3d(0, -20px, 0);
//   }
//   to {
//     opacity: 1;
//     transform: translate3d(0, 0, 0);
//   }
// }
// .animate-fade-in-down {
//   animation: fadeInDown 0.5s ease forwards;
// }
