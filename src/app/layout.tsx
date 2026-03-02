import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rural TN Clinic Booker — Telemedicine Appointment System",
  description:
    "Book appointments with PHC doctors digitally. Access quality healthcare from rural Tamil Nadu — no long queues, no wasted trips.",
  keywords: ["telemedicine", "Tamil Nadu", "PHC", "healthcare", "rural", "appointment", "booking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
