import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, VT323, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { DesignTweaksProvider } from '@/theme/DesignTweaksProvider';
import { TweaksDock } from '@/components/ui/TweaksPanel';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});
const pixel = VT323({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: '400',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Mind Dojo',
  description: 'Brain training mini games',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${pixel.variable} ${mono.variable}`}
    >
      <body className="bg-[var(--bg)] text-[var(--text)] font-[family-name:var(--font-body)] h-dvh overflow-hidden antialiased">
        <ThemeProvider>
          <DesignTweaksProvider>
            {children}
            <TweaksDock />
          </DesignTweaksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
