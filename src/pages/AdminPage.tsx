import { LoginForm } from '@/features/auth';
import '@/styles/pages.css';

export function AdminPage(): React.JSX.Element {
  return (
    <main className="page">
      <LoginForm title="Admin Login" redirectTo="/dashboard" />
    </main>
  );
}
