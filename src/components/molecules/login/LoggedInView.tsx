import Popover from '@/util/Popover';
import { User } from '@supabase/supabase-js';
import ThemeToggle from '../theme/ThemeToggle';
import { LogOut, User as UserIcon } from 'lucide-react';

interface LoggedInViewProps {
    user: User;
    buttonRef: React.RefObject<HTMLButtonElement>;
    showPopover: boolean;
    anchorRect: DOMRect | null;
    handleOpenPopover: () => void;
    setShowPopover: (show: boolean) => void;
    handleSignOut: () => void;
}

export default function LoggedInView({
    user,
    buttonRef,
    showPopover,
    anchorRect,
    handleOpenPopover,
    setShowPopover,
    handleSignOut
}: LoggedInViewProps) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const displayName = user.user_metadata?.full_name ?? user.email ?? '사용자';

    return (
        <div className='login absolute top-4 right-4 flex items-center gap-2'>
            <ThemeToggle />
            <button
                ref={buttonRef}
                onClick={handleOpenPopover}
                className='p-1 rounded-full glass-button hover:scale-105 transition-all flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10'
                aria-label="사용자 메뉴"
                title={displayName}
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt='프로필 아이콘'
                        className='w-7 h-7 rounded-full object-cover'
                    />
                ) : (
                    <div className='w-7 h-7 rounded-full flex items-center justify-center text-title'>
                        <UserIcon size={18} />
                    </div>
                )}
            </button>

            <Popover
                isOpen={showPopover}
                onClose={() => setShowPopover(false)}
                anchorRect={anchorRect}
                width={220}
                placement="bottom"
            >
                <div className='flex flex-col items-center gap-3 p-2 text-center'>
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt='프로필 아이콘'
                            className='w-14 h-14 rounded-full object-cover shadow-sm border border-black/10 dark:border-white/15'
                        />
                    ) : (
                        <div className='w-14 h-14 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-title border border-black/10 dark:border-white/15'>
                            <UserIcon size={28} />
                        </div>
                    )}
                    <div className='flex flex-col items-center max-w-full overflow-hidden px-1'>
                        <p className='font-semibold text-title text-sm truncate max-w-[190px]'>
                            {displayName}
                        </p>
                        {user.email && (
                            <p className='text-xs text-context truncate max-w-[190px] mt-0.5'>
                                {user.email}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleSignOut}
                        aria-label="로그아웃"
                        className='w-full py-2 px-3 bg-red-500/90 dark:bg-red-600/90 hover:bg-red-600 dark:hover:bg-red-500 text-white rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow active:scale-95 group'
                    >
                        <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
                        <span>로그아웃</span>
                    </button>
                </div>
            </Popover>
        </div>
    );
}
