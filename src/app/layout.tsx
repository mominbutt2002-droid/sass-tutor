import type { Metadata } from "next";
import { Suspense } from "react";
import { Geologica, Cormorant_SC } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const geologica = Geologica({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geologica",
  display: "swap",
});

const cormorantSc = Cormorant_SC({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Глагол AI — Персональный AI-репетитор русского языка",
  description:
    "SaaS-платформа изучения русского языка на базе Gemini 3.5 Flash-Lite: 4 этапа, грамматика, правописание, квизы, произношение, Speaking и Listening.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${geologica.variable} ${cormorantSc.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <Suspense fallback={<div className="h-16 border-b border-border bg-card/85" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
