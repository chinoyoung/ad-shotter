"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState } from "react";

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error) {
      setAuthError("An error occurred during sign in. Please try again.");
      console.error("Login error:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Signing you in..." />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Ad Shotter Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.518 0-10 4.482-10 10s4.482 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.082z"
                fill="#4285F4"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        {authError && (
          <div className="mt-4 text-center text-red-500 text-sm">
            {authError}
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Only @goabroad.com email addresses are allowed</p>
        </div>
      </div>
    </div>
  );
}
