import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "./components/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "LoopWar.dev - The Future of AI-Powered Coding Education",
  description: "Your personal AI coding dojo. We're redefining learning by combining AI-guidance with gamified challenges to forge career-ready developers.",
  icons: {
    icon: [
      {
        url: '/loopwar-logo-icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/logo.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/loopwar-logo-icon.svg',
    apple: '/loopwar-logo-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* LoopWar Favicon Configuration */}
        <link rel="icon" type="image/svg+xml" href="/loopwar-logo-icon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/loopwar-logo-icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/loopwar-logo-icon.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/loopwar-logo-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${sora.variable} antialiased`}>
        {/* Inline script to apply theme early (pre-hydration) so dark mode persists across pages */}
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
              document.body.classList.add('dark-mode');
            } else {
              document.documentElement.classList.remove('dark-mode');
              document.body.classList.remove('dark-mode');
            }
          } catch (err) {
            // noop
          }
        })();` }} />

        <ThemeProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
