import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

export const useTheme = () => {
    const mode = useAppSelector((state) => state.theme.mode);

    useEffect(() => {
        const root = window.document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [mode]);

    return { mode };
};
