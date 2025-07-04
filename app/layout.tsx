import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers/Provider';

export const metadata: Metadata = {
  title: 'DoorFrame',
  description: 'A simple google extension to open a new tab with a custom URL',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
