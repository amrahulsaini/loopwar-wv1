import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "LoopWar.dev - The Future of AI-Powered Coding Education",
  description: "Your personal AI coding dojo. We're redefining learning by combining AI-guidance with gamified challenges to forge career-ready developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
