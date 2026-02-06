import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authService from '@/services/authService';
import { testCredentials } from '@/test/testCredentials';
import { renderWithRouter } from '@/test/testUtils';
import { LoginForm } from './LoginForm';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  login: vi.fn(),
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render login form with all elements', () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('login-title')).toHaveTextContent('Login');
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
      expect(screen.getByTestId('login-submit')).toBeInTheDocument();
      expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      renderWithRouter(<LoginForm title="Admin Login" />);

      expect(screen.getByTestId('login-title')).toHaveTextContent('Admin Login');
    });

    it('should have correct input types', () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email');
      expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'password');
    });

    it('should have remember me checkbox unchecked by default', () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByTestId('remember-me-checkbox')).not.toBeChecked();
    });

    it('should have forgot password link', () => {
      renderWithRouter(<LoginForm />);

      const link = screen.getByTestId('forgot-password-link');
      expect(link).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('form validation', () => {
    it('should show error when submitting with empty email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('password-input'), testCredentials.user.password);
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show error when submitting with empty password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('email-input'), 'invalidemail');
      await user.type(screen.getByTestId('password-input'), testCredentials.user.password);
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should clear email error when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      // Submit empty form to trigger errors
      await user.click(screen.getByTestId('login-submit'));
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      // Start typing in email field
      await user.type(screen.getByTestId('email-input'), 't');

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });

    it('should clear password error when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      // Submit empty form to trigger errors
      await user.click(screen.getByTestId('login-submit'));
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });

      // Start typing in password field
      await user.type(screen.getByTestId('password-input'), 'p');

      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });

    it('should not call login API when form is invalid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      await user.click(screen.getByTestId('login-submit'));

      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('should call login with credentials when form is valid', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.login).mockResolvedValue({ success: true });

      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('email-input'), testCredentials.user.email);
      await user.type(screen.getByTestId('password-input'), testCredentials.user.password);
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: testCredentials.user.email,
          password: testCredentials.user.password,
          rememberMe: false,
        });
      });
    });

    it('should pass rememberMe when checked', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.login).mockResolvedValue({ success: true });

      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('email-input'), testCredentials.user.email);
      await user.type(screen.getByTestId('password-input'), testCredentials.user.password);
      await user.click(screen.getByTestId('remember-me-checkbox'));
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: testCredentials.user.email,
          password: testCredentials.user.password,
          rememberMe: true,
        });
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.login).mockResolvedValue({ success: true });

      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('email-input'), testCredentials.user.email);
      await user.type(screen.getByTestId('password-input'), testCredentials.user.password);
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should navigate to custom redirectTo on successful login', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.login).mockResolvedValue({ success: true });

      renderWithRouter(<LoginForm redirectTo="/admin/dashboard" />);

      await user.type(screen.getByTestId('email-input'), testCredentials.user.email);
      await user.type(screen.getByTestId('password-input'), testCredentials.user.password);
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
      });
    });

    it('should display error message on failed login', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.login).mockResolvedValue({
        success: false,
        error: 'Invalid email or password',
      });

      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('email-input'), testCredentials.user.email);
      await user.type(screen.getByTestId('password-input'), testCredentials.invalid.password);
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid email or password');
      });
    });

    it('should display generic error on login exception', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.login).mockRejectedValue(new Error('Network error'));
      // Suppress console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('email-input'), testCredentials.user.email);
      await user.type(screen.getByTestId('password-input'), testCredentials.user.password);
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toHaveTextContent(
          'An unexpected error occurred. Please try again.',
        );
      });

      consoleSpy.mockRestore();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      // Create a promise that we can control
      let resolveLogin: (value: { success: boolean }) => void;
      vi.mocked(authService.login).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve;
          }),
      );

      renderWithRouter(<LoginForm />);

      await user.type(screen.getByTestId('email-input'), testCredentials.user.email);
      await user.type(screen.getByTestId('password-input'), testCredentials.user.password);
      await user.click(screen.getByTestId('login-submit'));

      // Button should show loading state
      expect(screen.getByTestId('login-submit')).toHaveTextContent('Logging in...');
      expect(screen.getByTestId('login-submit')).toBeDisabled();

      // Resolve the login
      resolveLogin!({ success: true });

      await waitFor(() => {
        expect(screen.getByTestId('login-submit')).toHaveTextContent('Login');
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    });

    it('should set aria-invalid on email input with error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('email-input')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should set aria-invalid on password input with error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('password-input')).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
