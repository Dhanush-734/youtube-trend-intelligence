import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardShell } from "@/components/layout/DashboardShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YouTube Trend Intelligence — Full-Stack Real-Time Video Analytics Dashboard",
  description:
    "Near-real-time YouTube video analytics, observed view velocities, custom trend score rankings, and historical snapshot telemetry powered by PostgreSQL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-yt-bg text-white font-sans antialiased selection:bg-yt-red/30 selection:text-white">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
