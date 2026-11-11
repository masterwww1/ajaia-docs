import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const ui = DM_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
});

const doc = Source_Serif_4({
  variable: "--font-doc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ajaia Docs",
  description: "Lightweight collaborative document editor for the Ajaia coding challenge",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ui.variable} ${doc.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
