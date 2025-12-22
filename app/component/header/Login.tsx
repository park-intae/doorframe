'use client';

import Popover from 'app/util/Popover';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showPopover, setShowPopover] = useState(false);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            router.push("/");
        }
    }, [status, router]);

    const handleOpenPopover = () => {
        if (buttonRef.current) {
            setAnchorRect(buttonRef.current.getBoundingClientRect());
        }
        setShowPopover(true);
    }

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'authenticated') {
        return (
            // <div className='login'>
            //     <p>{session.user?.name}</p>
            //     <img src={session.user?.image ?? ""} alt='프로필' className='profile'></img>
            //     <button onClick={() => signOut({ callbackUrl: "/login" })} className='logoutBtn'>로그아웃</button>
            // </div>
            <div className='login mr-5'>
                <button
                    ref={buttonRef}
                    onClick={handleOpenPopover}
                    className='popoverBtn'
                >
                    <img src={session.user?.image ?? ""} alt='프로필' className='profile w-8 h-8 rounded-full'></img>
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
                            src={session.user?.image ?? ""}
                            alt='프로필'
                            className='w-16 h-16 rounded-full'
                        />
                        <p className='font-semibold'>{session.user?.name}</p>
                        <p className='text-sm text-gray-600'>{session.user?.email}</p>
                        <button
                            onClick={() => {
                                setShowPopover(false);
                                signOut({ callbackUrl: "/" });
                            }}
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
                    onClick={() => {
                        setShowPopover(false);
                        signIn("google");
                    }}
                    className="w-full py-3 px-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <span>구글 계정으로 로그인</span>
                </button>
            </Popover>
        </div>
    );
}