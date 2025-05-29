import type { Metadata } from 'next';
import './globals.css';

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
    <html>
      <body>{children}</body>
    </html>
  );
}
