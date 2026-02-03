import { NavLink, useLocation } from 'react-router-dom';
import './Navigation.css';

const VISIBLE_PATHS = ['/login', '/admin'];

export function Navigation(): React.JSX.Element | null {
  const location = useLocation();

  // Only show navigation on /login and /admin pages
  if (!VISIBLE_PATHS.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="navigation" data-testid="navigation">
      <NavLink
        to="/login"
        className={({ isActive }) =>
          `navigation__link ${isActive ? 'navigation__link--active' : ''}`
        }
        data-testid="nav-login"
      >
        Login
      </NavLink>
      <NavLink
        to="/admin"
        className={({ isActive }) =>
          `navigation__link ${isActive ? 'navigation__link--active' : ''}`
        }
        data-testid="nav-admin"
      >
        Admin
      </NavLink>
    </nav>
  );
}
