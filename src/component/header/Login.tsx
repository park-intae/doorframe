import { supabase } from '@/config/supabase';
import Popover from '@/util/Popover';
import { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        return (
            <div className='login mr-5'>
                <button
                    ref={buttonRef}
                    onClick={handleOpenPopover}
                    className='popoverBtn'
                >
                    <img src={user.user_metadata?.avatar_url ?? ""} alt='프로필' className='profile w-8 h-8 rounded-full'></img>
                </button>

                <Popover
                    isOpen={showPopover}
                    onClose={() => setShowPopover(false)}
                    anchorRect={anchorRect}
                    width={200}
                    placement="bottom"
                >
                    <div className='flex flex-col items-center gap-3 bg-white p-3'>
                        <img
                            src={user.user_metadata?.avatar_url ?? ""}
                            alt='프로필'
                            className='w-16 h-16 rounded-full'
                        />
                        <p className='font-semibold'>{user.user_metadata?.full_name ?? user.email}</p>
                        <p className='text-sm text-context'>{user.email}</p>
                        <button
                            onClick={handleSignOut}
                            className='w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
                        >
                            로그아웃
                        </button>
                    </div>
                </Popover>
            </div>
        );
    }

    return (
        <div className='login mr-5'>
            <button
                ref={buttonRef}
                onClick={handleOpenPopover}
                className='flex justify-center items-center w-11 h-11 glass-button text-main rounded-full hover:brightness-95 transition-colors'
            >
                <img src='/login.png' className="w-8 h-8" />
            </button>

            <Popover
                isOpen={showPopover}
                onClose={() => setShowPopover(false)}
                anchorRect={anchorRect}
                width={300}
                placement="bottom"
            >
                <div className="p-2">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full py-3 px-4 bg-white border border-main rounded-lg hover:bg-background transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow group"
                    >
                        {/* 구글 로고 SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium text-context group-hover:text-title">
                            Google 계정으로 로그인
                        </span>
                    </button>
                </div>
            </Popover>
        </div>
    );
}