import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "DEHYDRATE — Deserialization Security Research",
  description:
    "Where serialized objects are dissected. Cross-language deserialization security research and training platform.",
  openGraph: {
    title: "DEHYDRATE — Deserialization Security Research",
    description:
      "Where serialized objects are dissected. Cross-language deserialization security research and training platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEHYDRATE — Deserialization Security Research",
    description:
      "Where serialized objects are dissected. Cross-language deserialization security research and training platform.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-serial-bg text-serial-text">
        {children}
      </body>
    </html>
  );
}
