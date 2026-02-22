import { supabase } from '@/config/supabase';
import { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPopover, setShowPopover] = useState(false);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // 현재 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser((session?.user ?? null));
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            const redirectTo = window.location.origin.endsWith('/')
                ? window.location.origin
                : `${window.location.origin}/`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                }
            });

            if (error) throw error;
            setShowPopover(false);
        } catch (error) {
            alert('로그인에 실패했습니다.');
        }
    }

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setShowPopover(false);
        } catch (error) {
            console.log('로그아웃 실패:', error)
        }
    };

    const handleOpenPopover = () => {
        if (buttonRef.current) {
            setAnchorRect(buttonRef.current.getBoundingClientRect());
        }
        setShowPopover(true);
    }

    return {
        user,
        loading,
        showPopover,
        anchorRect,
        buttonRef,
        setShowPopover,
        handleGoogleSignIn,
        handleSignOut,
        handleOpenPopover
    }
}
