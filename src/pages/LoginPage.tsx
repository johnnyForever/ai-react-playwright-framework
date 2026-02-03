import { LoginForm } from '@/features/auth';
import '@/styles/pages.css';

export function LoginPage(): JSX.Element {
  return (
    <main className="page">
      <LoginForm title="Login" redirectTo="/dashboard" />
    </main>
  );
}
