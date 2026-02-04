import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '@/services/authService';

export function ProtectedRoute(): React.JSX.Element {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
