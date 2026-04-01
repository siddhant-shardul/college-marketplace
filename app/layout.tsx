import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "College Marketplace",
    template: "%s • College Marketplace",
  },
  description: "Buy, sell, and chat with students on your campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen text-slate-900">
        <div className="relative min-h-screen">
          <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),_transparent_45%)]" />
          <Navbar />
          <main className="relative z-10 w-full pb-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
