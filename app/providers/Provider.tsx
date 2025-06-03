'use client';

import { SessionProvider } from 'next-auth/react';
import RecoilProvider from './RecoilProvider';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <RecoilProvider>{children}</RecoilProvider>
        </SessionProvider>
    );
}