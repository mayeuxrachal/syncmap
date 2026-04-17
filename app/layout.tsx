import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; // <--- ADD THIS IMPORT
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncMap | Find the Perfect Timezone Overlap",
  description: "A utility for global teams to find their ideal meeting times.",
  robots: "index, follow", // This tells Google to crawl the site
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "SyncMap | Find the Perfect Timezone Overlap",
    description: "A utility for global teams to find their ideal meeting times.",
    url: "https://syncmap.app",
    siteName: "SyncMap",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-4532346031383484", // Replace with your ID
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ADD THIS BLOCK - Replace with your actual Publisher ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4532346031383484"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}