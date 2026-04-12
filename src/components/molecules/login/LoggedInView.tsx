import Popover from '@/util/Popover';
import { User } from '@supabase/supabase-js';

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
    return (
        <div className='login absolute top-1 right-1'>
            <button
                ref={buttonRef}
                onClick={handleOpenPopover}
                className='popoverBtn'
                aria-label="사용자 메뉴"
            >
                <img src={user.user_metadata?.avatar_url ?? ""} alt='프로필 아이콘' className='profile w-8 h-8 rounded-full'></img>
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
                        alt='프로필 아이콘'
                        className='w-16 h-16 rounded-full'
                    />
                    <p className='font-semibold'>{user.user_metadata?.full_name ?? user.email}</p>
                    <p className='text-sm text-context'>{user.email}</p>
                    <button
                        onClick={handleSignOut}
                        aria-label="로그아웃"
                        className='w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
                    >
                        로그아웃
                    </button>
                </div>
            </Popover>
        </div>
    );
}
