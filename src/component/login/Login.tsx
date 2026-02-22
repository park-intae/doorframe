import { useAuth } from '@/hooks/useAuth';
import LoggedInView from './LoggedInView';
import LoggedOutView from './LoggedOutView';

export default function Login() {
    const {
        user,
        loading,
        showPopover,
        anchorRect,
        buttonRef,
        setShowPopover,
        handleGoogleSignIn,
        handleSignOut,
        handleOpenPopover
    } = useAuth();

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