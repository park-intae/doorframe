import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers/Provider';
import ListPersistence from './component/ListPersistence';

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
        <Providers>
          <ListPersistence />
          {children}
        </Providers>
      </body>
    </html>
  );
}
