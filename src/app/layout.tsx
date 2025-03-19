import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryClientProvider } from "@/providers/react-query-client-provider";
import Navbar from "./navbar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mole | LinkedIn Profile Scraper",
  description:
    "Extract and analyze LinkedIn profiles efficiently with Mole. A powerful tool for data extraction from LinkedIn profiles.",
  keywords: [
    "LinkedIn scraper",
    "profile extraction",
    "LinkedIn data",
    "recruitment tool",
    "lead generation",
    "Mole app",
  ],
  authors: [
    {
      name: "Mole",
      url: "https://mole.tejasvajaitly.com",
    },
  ],
  openGraph: {
    title: "Mole | LinkedIn Profile Scraper",
    description: "Extract and analyze LinkedIn profiles efficiently with Mole",
    type: "website",
    siteName: "Mole",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mole | LinkedIn Profile Scraper",
    description: "Extract and analyze LinkedIn profiles efficiently with Mole",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ReactQueryClientProvider>
        <html lang="en" className="dark">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
          >
            <Navbar> {children}</Navbar>
            <Toaster richColors />
          </body>
        </html>
      </ReactQueryClientProvider>
    </ClerkProvider>
  );
}
