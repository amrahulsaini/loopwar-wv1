import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "./components/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProgressBar from "./components/ProgressBar";

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
        {/* Theme detection script - must run before body renders */}
        <script dangerouslySetInnerHTML={{ __html: `(() => {
          try {
            var theme = null;
            // Try cookie first
            var m = document.cookie.match('(?:^|;)\\s*theme=([^;]+)');
            if (m) theme = decodeURIComponent(m[1]);
            // Fallback to localStorage
            if (!theme) {
              try { theme = localStorage.getItem('theme'); } catch(e) { theme = null; }
            }
            // Fallback to system preference
            if (!theme && window.matchMedia) {
              theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            if (theme === 'dark') {
              document.documentElement.classList.add('dark-mode');
            } else {
              document.documentElement.classList.remove('dark-mode');
            }
          } catch (err) {
            // noop
          }
        })();` }} />
        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${sora.variable} antialiased`}>
        {/* Theme provider handles subsequent theme changes */}

        <ThemeProvider>
          <NotificationProvider>
            <ProgressBar />
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
