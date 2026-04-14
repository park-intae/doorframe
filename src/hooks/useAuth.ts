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
        // 렌더링이 완전히 끝난 후 세션 체크
        const timer = setTimeout(() => {
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                if (!session) {
                    // 세션이 없으면 익명 로그인 시도
                    const { data, error } = await supabase.auth.signInAnonymously();
                    if (!error) setUser(data.user);
                } else {
                    setUser((session?.user ?? null));
                }
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });
        }, 0);

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            clearTimeout(timer);
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
            console.error('로그아웃 실패:', error);
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
