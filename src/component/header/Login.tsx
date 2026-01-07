import { auth, googleProvider } from '@/config/firebase';
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
        })
        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
            });

            if (error) throw error;
            setShowPopover(false);
        } catch (error) {
            console.log('로그인 실패:', error);
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
                    <div className='flex flex-col items-center gap-3'>
                        <img
                            src={user.user_metadata?.avatar_url ?? ""}
                            alt='프로필'
                            className='w-16 h-16 rounded-full'
                        />
                        <p className='font-semibold'>{user.user_metadata?.full_name ?? user.email}</p>
                        <p className='text-sm text-gray-600'>{user.email}</p>
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
                className='popoverBtn'
            >
                로그인
            </button>

            <Popover
                isOpen={showPopover}
                onClose={() => setShowPopover(false)}
                anchorRect={anchorRect}
                width={250}
                placement="bottom"
            >
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 px-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <span>구글 계정으로 로그인</span>
                </button>
            </Popover>
        </div>
    );
}