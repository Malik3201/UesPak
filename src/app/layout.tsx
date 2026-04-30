import type { Metadata } from "next";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="flex min-h-screen flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
