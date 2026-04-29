import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/shared/providers";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "TravelNusa Indonesia - Jelajahi Keindahan Nusantara",
    template: "%s | TravelNusa Indonesia",
  },
  description:
    "Platform travel Indonesia untuk booking paket wisata terbaik ke Bali, Lombok, Labuan Bajo, Yogyakarta, Raja Ampat, dan destinasi populer lainnya.",
  openGraph: {
    title: "TravelNusa Indonesia",
    description:
      "Booking paket wisata Indonesia dengan itinerary terkurasi, admin responsif, dan destinasi pilihan Nusantara.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
