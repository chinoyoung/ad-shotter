"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication status once the loading is complete
    if (!loading) {
      if (isAuthenticated) {
        setAuthorized(true);
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading indicator while checking authentication
  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  // Return children only if authorized
  return authorized ? <>{children}</> : null;
}
