import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings";
import { DatabaseProvider } from "@/lib/db-provider";
import { AppShell } from "@/components/app-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumora",
  description: "A calm, fast, and joyful second brain for individuals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full">
        <SettingsProvider>
          <DatabaseProvider>
            <AppShell>{children}</AppShell>
          </DatabaseProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
