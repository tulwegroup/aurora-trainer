import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurora Trainer - Unified Mineral & Hydrocarbon AI Platform",
  description: "World's first unified AI platform for mineral exploration and hydrocarbon prospectivity analysis. Powered by advanced neural networks and real-time data processing.",
  keywords: ["Aurora Trainer", "Mineral Exploration", "Hydrocarbon Analysis", "AI Platform", "Geological Survey", "Petroleum Systems", "Neural Networks"],
  authors: [{ name: "Aurora AI Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Aurora Trainer - Unified Exploration Platform",
    description: "AI-powered platform for mineral and hydrocarbon exploration with advanced neural networks",
    url: "https://chat.z.ai",
    siteName: "Aurora Trainer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurora Trainer - Unified Exploration Platform",
    description: "AI-powered platform for mineral and hydrocarbon exploration",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <div id="root">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
