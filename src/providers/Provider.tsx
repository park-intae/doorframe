

import { store } from '@/store';
import { Provider as ReduxProvider } from 'react-redux';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ReduxProvider store={store}>
            {children}
        </ReduxProvider>
    );
}