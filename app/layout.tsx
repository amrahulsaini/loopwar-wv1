import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "./components/NotificationContext";

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
      <head>
        {/* Responsive Design */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${sora.variable} antialiased`}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
