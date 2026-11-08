import type { Metadata, Viewport } from "next";
import {
  Archivo_Black,
  Inter,
  JetBrains_Mono,
  Oswald,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetMono = JetBrains_Mono({
  variable: "--font-jet-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://behind-the-cut.vercel.app"),
  title: "Behind The Cut — Short-Form Video Editor",
  description:
    "Short-form video editor for podcasts, creators and brands. Reels, Shorts, TikToks and UGC ads cut for retention — watch the reel and book a free trial cut.",
  keywords: [
    "video editor",
    "short-form editor",
    "reels editor",
    "tiktok editor",
    "podcast clips",
    "ugc ads",
    "video editing",
  ],
  authors: [{ name: "Behind The Cut" }],
  openGraph: {
    title: "Behind The Cut — Cuts that keep people watching",
    description:
      "Short-form video editor for podcasts, creators and brands. Watch the reel and start a project.",
    type: "website",
    images: [{ url: "/videos/poster-2.jpg", width: 1280, height: 720 }],
  },
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${archivoBlack.variable} ${inter.variable} ${jetMono.variable} ${oswald.variable} font-sans antialiased bg-[#050505] text-[#f4f4f2]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
