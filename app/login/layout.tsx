import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Ad Shotter Dashboard",
  description: "Sign in to access your dashboard",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
