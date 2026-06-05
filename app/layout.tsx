import type { Metadata } from 'next';
import { Inter, IBM_Plex_Serif } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter-var' });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-serif-var',
});

export const metadata: Metadata = {
  title: 'Horizon Bank',
  description: 'Horizon is a modern banking platform for everyone',
  icons: { icon: '/icons/logo.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable} font-inter`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
