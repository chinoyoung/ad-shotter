import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unauthorized - Ad Shotter Dashboard",
  description: "Unauthorized access to Ad Shotter Dashboard",
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
