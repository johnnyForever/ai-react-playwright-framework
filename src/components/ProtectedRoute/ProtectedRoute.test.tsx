import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authService from '@/services/authService';
import { ProtectedRoute } from './ProtectedRoute';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  isAuthenticated: vi.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRoutes = (initialPath: string) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
            <Route path="/checkout" element={<div data-testid="checkout-page">Checkout</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  };

  it('should render child route when authenticated', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    renderWithRoutes('/dashboard');

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);

    renderWithRoutes('/dashboard');

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
  });

  it('should protect checkout route when not authenticated', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);

    renderWithRoutes('/checkout');

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('checkout-page')).not.toBeInTheDocument();
  });

  it('should allow access to checkout when authenticated', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    renderWithRoutes('/checkout');

    expect(screen.getByTestId('checkout-page')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('should call isAuthenticated on render', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    renderWithRoutes('/dashboard');

    expect(authService.isAuthenticated).toHaveBeenCalled();
  });
});
