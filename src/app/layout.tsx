import type { Metadata } from "next";
import "./globals.css";
import { defaultMetadata, mergeRootSiteMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return mergeRootSiteMetadata(defaultMetadata);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
