import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuantInsight",
  description: "AI-native financial research workbench"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hans">
      <body>{children}</body>
    </html>
  );
}
