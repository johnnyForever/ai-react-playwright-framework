import { useState, type FormEvent, type JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
import { validateLoginForm, hasErrors } from '@/lib/validation';
import type { ValidationErrors } from '@/types/auth';
import './LoginForm.css';

interface LoginFormProps {
  title?: string;
  redirectTo?: string;
}

export function LoginForm({
  title = 'Login',
  redirectTo = '/dashboard',
}: LoginFormProps): JSX.Element {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setApiError(null);

    // Frontend validation - no backend call if invalid
    const errors = validateLoginForm(email, password);
    setValidationErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email, password, rememberMe });

      if (response.success) {
        navigate(redirectTo);
      } else {
        setApiError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string): void => {
    setEmail(value);
    // Clear validation error when user starts typing
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (value: string): void => {
    setPassword(value);
    // Clear validation error when user starts typing
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate data-testid="login-form">
      <h1 className="login-form__title" data-testid="login-title">{title}</h1>

      {apiError && (
        <div className="login-form__api-error" role="alert" data-testid="login-error">
          {apiError}
        </div>
      )}

      <div className="login-form__field">
        <label htmlFor="email" className="login-form__label">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`login-form__input ${validationErrors.email ? 'login-form__input--error' : ''}`}
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          data-testid="email-input"
        />
        {validationErrors.email && (
          <div id="email-error" className="login-form__error" role="alert" data-testid="email-error">
            {validationErrors.email}
          </div>
        )}
      </div>

      <div className="login-form__field">
        <label htmlFor="password" className="login-form__label">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={`login-form__input ${validationErrors.password ? 'login-form__input--error' : ''}`}
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={!!validationErrors.password}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
          data-testid="password-input"
        />
        {validationErrors.password && (
          <div id="password-error" className="login-form__error" role="alert" data-testid="password-error">
            {validationErrors.password}
          </div>
        )}
      </div>

      <div className="login-form__checkbox-field">
        <input
          id="rememberMe"
          type="checkbox"
          className="login-form__checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          data-testid="remember-me-checkbox"
        />
        <label htmlFor="rememberMe" className="login-form__checkbox-label">
          Remember me
        </label>
      </div>

      <button
        type="submit"
        className="login-form__submit"
        disabled={isLoading}
        data-testid="login-submit"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <div className="login-form__links">
        <Link to="/forgot-password" className="login-form__link" data-testid="forgot-password-link">
          Forgot Password?
        </Link>
      </div>
    </form>
  );
}
