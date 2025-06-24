'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showPopover, setShowPopover] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            router.push("/");
        }
    }, [status])

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'authenticated') {
        return (
            <div>
                <p>{session.user?.name}</p>
                <img src={session.user?.image ?? ""} alt='프로필' className='profile'></img>
                <button onClick={() => signOut({ callbackUrl: "/login" })} className='logoutBtn'>로그아웃</button>
            </div>
        );
    }

    return (
        <div className='login'>
            <button onClick={() => setShowPopover(prev => !prev)} className='popoverBtn'>로그인</button>
            <div className='loginPopOver'>
                {showPopover && (<p onClick={() => signIn("google")} className="loginBtn">구글 계정으로 로그인</p>)}
            </div>
        </div>
    )
}