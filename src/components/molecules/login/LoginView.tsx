import { User } from '@supabase/supabase-js';
import LoggedInView from './LoggedInView';
import LoggedOutView from './LoggedOutView';

interface LoginViewProps {
    user: User | null;
    loading: boolean;
    isSigningIn?: boolean;
    showPopover: boolean;
    anchorRect: DOMRect | null;
    buttonRef: React.RefObject<HTMLButtonElement>;
    setShowPopover: (show: boolean) => void;
    handleGoogleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    handleOpenPopover: () => void;
}

export default function LoginView({
    user,
    loading,
    isSigningIn = false,
    showPopover,
    anchorRect,
    buttonRef,
    setShowPopover,
    handleGoogleSignIn,
    handleSignOut,
    handleOpenPopover
}: LoginViewProps) {
    if (loading) {
        return (
            <div className='login absolute top-4 right-4 flex items-center gap-2'>
                <div className='w-9 h-9 rounded-full glass-button opacity-40 animate-pulse' />
            </div>
        );
    }

    if (user && !user.is_anonymous) {
        return (
            <LoggedInView
                user={user}
                buttonRef={buttonRef}
                showPopover={showPopover}
                anchorRect={anchorRect}
                handleOpenPopover={handleOpenPopover}
                setShowPopover={setShowPopover}
                handleSignOut={handleSignOut}
            />
        );
    }

    return (
        <LoggedOutView
            buttonRef={buttonRef}
            showPopover={showPopover}
            anchorRect={anchorRect}
            isSigningIn={isSigningIn}
            handleOpenPopover={handleOpenPopover}
            setShowPopover={setShowPopover}
            handleGoogleSignIn={handleGoogleSignIn}
        />
    );
}
