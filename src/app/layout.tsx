import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/theme/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mind Dojo',
  description: 'Brain training mini games',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--text)] h-screen overflow-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
