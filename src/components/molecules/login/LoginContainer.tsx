import { useAuth } from '@/hooks/useAuth';
import LoginView from './LoginView';

export default function LoginContainer() {
    const auth = useAuth();
    return <LoginView {...auth} />;
}
