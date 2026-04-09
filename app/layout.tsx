import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { AppProvider } from "@/components/app-provider";
import { ThemeProvider } from "@/components/theme-provider";

import "@/app/globals.css";

const uiFont = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Tabit",
  description: "Tracker d’habitudes premium avec journal quotidien, calendrier et mode hors ligne.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${uiFont.variable} ${displayFont.variable}`}>
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
