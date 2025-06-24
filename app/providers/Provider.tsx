'use client';

import { store } from 'app/store';
import { Provider as ReduxProvider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ReduxProvider store={store}>
                {children}
            </ReduxProvider>
        </SessionProvider>
    );
}