import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app/globals.css";
// import { Analytics } from "@vercel/analytics/react";

// import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Emagazinek",
  description: "Animation Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
        {/* <Analytics/> */}
      </body>
    </html>
    
  );
}
