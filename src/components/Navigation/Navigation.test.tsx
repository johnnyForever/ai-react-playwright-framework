import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/testUtils';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  describe('visibility', () => {
    it('should render on /login path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/login'] });

      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('should render on /admin path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/admin'] });

      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('should not render on /dashboard path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/dashboard'] });

      expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
    });

    it('should not render on /checkout path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/checkout'] });

      expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
    });

    it('should not render on / (root) path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/'] });

      expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
    });

    it('should not render on /forgot-password path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/forgot-password'] });

      expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should have Login link', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/login'] });

      const loginLink = screen.getByTestId('nav-login');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
      expect(loginLink).toHaveTextContent('Login');
    });

    it('should have Admin link', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/login'] });

      const adminLink = screen.getByTestId('nav-admin');
      expect(adminLink).toBeInTheDocument();
      expect(adminLink).toHaveAttribute('href', '/admin');
      expect(adminLink).toHaveTextContent('Admin');
    });

    it('should mark Login as active on /login path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/login'] });

      const loginLink = screen.getByTestId('nav-login');
      expect(loginLink).toHaveClass('navigation__link--active');
    });

    it('should mark Admin as active on /admin path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/admin'] });

      const adminLink = screen.getByTestId('nav-admin');
      expect(adminLink).toHaveClass('navigation__link--active');
    });

    it('should not mark Login as active on /admin path', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/admin'] });

      const loginLink = screen.getByTestId('nav-login');
      expect(loginLink).not.toHaveClass('navigation__link--active');
    });
  });

  describe('accessibility', () => {
    it('should be a nav element', () => {
      renderWithRouter(<Navigation />, { initialEntries: ['/login'] });

      const nav = screen.getByTestId('navigation');
      expect(nav.tagName).toBe('NAV');
    });
  });
});
