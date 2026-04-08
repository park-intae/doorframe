import { User } from '@supabase/supabase-js';
import LoggedInView from './LoggedInView';
import LoggedOutView from './LoggedOutView';

interface LoginViewProps {
    user: User | null;
    loading: boolean;
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
    showPopover,
    anchorRect,
    buttonRef,
    setShowPopover,
    handleGoogleSignIn,
    handleSignOut,
    handleOpenPopover
}: LoginViewProps) {
    if (loading) {
        return <div className='absolute top-4 right-4 w-11 h-11'>Loading...</div>;
    }

    if (user) {
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
            handleOpenPopover={handleOpenPopover}
            setShowPopover={setShowPopover}
            handleGoogleSignIn={handleGoogleSignIn}
        />
    );
}
