import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { CustomCursor } from '@/components/custom-cursor';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Ace Interview',
  description: 'AI-powered mock interviews to help you land your dream job.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'h-full font-body antialiased',
          inter.variable,
          poppins.variable
        )}
      >
        <ThemeProvider>
          <CustomCursor />
          {children}
          <Toaster />
        </ThemeProvider>
        {/* Circular Tunnel Overlay */}
        <div id="tunnel-overlay">
          <div className="tunnel-container">
            {Array.from({ length: 12 }).map((_, i) => {
              const zDepth = -3000 + (i * 200);
              const scale = 0.1 + (i * 0.06);
              const delay = i * 0.05;
              return (
                <div
                  key={i}
                  className="tunnel-ring"
                  data-ring-index={i}
                  style={{
                    '--ring-z': `${zDepth}px`,
                    '--ring-scale': scale,
                    '--ring-delay': `${delay}s`,
                    animationDelay: `var(--ring-delay)`,
                  } as React.CSSProperties}
                />
              );
            })}
            <div className="vortex-flash" />
          </div>
        </div>
      </body>
    </html>
  );
}
