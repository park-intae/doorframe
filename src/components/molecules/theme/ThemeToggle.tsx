import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { toggleTheme } from '../../../store/slice/themeSlice';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const dispatch = useAppDispatch();
    const mode = useAppSelector((state) => state.theme.mode);

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full glass-button hover:scale-105 transition-all text-title"
            aria-label="테마 전환"
        >
            {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
