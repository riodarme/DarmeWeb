import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DarmeWeb",
  description: "Solusi mudah dan cepat untuk pembelian produk digital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gradient-to-br from-green-700 to-emerald-900 text-white`}
      >
        {/* ✅ Navbar global */}
        <Navbar />

        {/* ✅ Konten halaman */}
        <main className="flex-grow">{children}</main>

        {/* ✅ Footer global */}
        <Footer />
      </body>
    </html>
  );
}
