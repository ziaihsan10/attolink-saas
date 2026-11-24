import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AttoLink — Creator Attribution & Anti-Coupon Leak Shield",
  description:
    "30-day attribution cookies, anti-coupon leak protection, and verified creator scorecards.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${inter.className} min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}