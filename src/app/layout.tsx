import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from "@/components/cosmic/sw-register";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Astral Ascendancy — Alien Trading Card Game",
  description:
    "An alien-themed trading card game set across a galaxy of warring civilizations. Command plasma beings, hive-swarms, silicon titans, nebula pirates & machine gods. Conquer the galaxy, one card at a time.",
  keywords: [
    "trading card game",
    "TCG",
    "alien card game",
    "space card game",
    "Astral Ascendancy",
    "deck builder",
    "strategy card game",
  ],
  authors: [{ name: "Astral Ascendancy" }],
  applicationName: "Astral Ascendancy",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Astral Ascendancy",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon-192.png"],
  },
  openGraph: {
    title: "Astral Ascendancy — Galactic Trading Card Game",
    description:
      "Conquer the galaxy, one card at a time. A free-to-play cosmic card strategy game built around sector combat, living factions, and cinematic card reveals.",
    siteName: "Astral Ascendancy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Astral Ascendancy",
    description: "An alien-themed trading card game. Conquer the galaxy, one card at a time.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
