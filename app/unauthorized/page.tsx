"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to login after 3 seconds
    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">401</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Unauthorized Access
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You don&apos;t have permission to access this page. Only users with
            @goabroad.com email addresses are allowed.
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to login page in 3 seconds...
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-6 w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
