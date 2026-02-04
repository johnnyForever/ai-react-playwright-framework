import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithBasket, createMockUser } from '@/test/testUtils';
import { DashboardHeader } from './DashboardHeader';
import * as authService from '@/services/authService';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getCurrentUser).mockReturnValue(
      createMockUser({ email: 'test@example.com', role: 'user' })
    );
  });

  describe('rendering', () => {
    it('should render header', () => {
      renderWithBasket(<DashboardHeader />);

      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    it('should display app title', () => {
      renderWithBasket(<DashboardHeader />);

      expect(screen.getByTestId('dashboard-title')).toHaveTextContent('React Demo App');
    });

    it('should display user email', () => {
      renderWithBasket(<DashboardHeader />);

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('should display logout button', () => {
      renderWithBasket(<DashboardHeader />);

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByTestId('logout-button')).toHaveTextContent('Logout');
    });

    it('should display basket icon', () => {
      renderWithBasket(<DashboardHeader />);

      expect(screen.getByTestId('basket-icon')).toBeInTheDocument();
    });
  });

  describe('admin badge', () => {
    it('should NOT display admin badge for regular user', () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(
        createMockUser({ role: 'user' })
      );

      renderWithBasket(<DashboardHeader />);

      expect(screen.queryByTestId('admin-badge')).not.toBeInTheDocument();
    });

    it('should display admin badge for admin user', () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(
        createMockUser({ role: 'admin', email: 'admin@example.com' })
      );

      renderWithBasket(<DashboardHeader />);

      expect(screen.getByTestId('admin-badge')).toBeInTheDocument();
      expect(screen.getByTestId('admin-badge')).toHaveTextContent('Admin');
    });
  });

  describe('logout functionality', () => {
    it('should call logout when logout button is clicked', async () => {
      const user = userEvent.setup();
      renderWithBasket(<DashboardHeader />);

      await user.click(screen.getByTestId('logout-button'));

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should navigate to login after logout', async () => {
      const user = userEvent.setup();
      renderWithBasket(<DashboardHeader />);

      await user.click(screen.getByTestId('logout-button'));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('when no user is logged in', () => {
    it('should not display user-specific elements', () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(null);

      renderWithBasket(<DashboardHeader />);

      expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-badge')).not.toBeInTheDocument();
    });
  });
});
