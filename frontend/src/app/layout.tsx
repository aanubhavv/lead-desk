import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadDesk — Software Development Studio",
  description:
    "Custom websites, Shopify apps, and mobile products. We partner with businesses to ship software that performs, converts, and scales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <div className="bg-mesh" />
        {children}
      </body>
    </html>
  );
}
