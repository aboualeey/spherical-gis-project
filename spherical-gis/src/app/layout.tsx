import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/providers/SessionWrapper";
import { ProductsProvider } from "@/lib/contexts/ProductsContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spherical GIS & RS",
  description: "Professional GIS, Remote Sensing, and Solar Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;cd
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          <ProductsProvider>
            {children}
            <Toaster position="top-right" />
          </ProductsProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
