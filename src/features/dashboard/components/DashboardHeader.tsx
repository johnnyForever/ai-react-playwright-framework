import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '@/services/authService';
import { BasketIcon } from '@/features/basket';
import './DashboardHeader.css';

export function DashboardHeader(): React.JSX.Element {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header" data-testid="dashboard-header">
      <h1 className="dashboard-header__title" data-testid="dashboard-title">React Demo App</h1>
      <div className="dashboard-header__actions">
        {user && (
          <>
            {user.role === 'admin' && (
              <span className="dashboard-header__admin-badge" data-testid="admin-badge">
                Admin
              </span>
            )}
            <span className="dashboard-header__user" data-testid="user-email">
              {user.email}
            </span>
          </>
        )}
        <BasketIcon />
        <button
          type="button"
          className="dashboard-header__logout"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
