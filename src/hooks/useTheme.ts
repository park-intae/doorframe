import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export const useTheme = () => {
    const dispatch = useAppDispatch();
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
