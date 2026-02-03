import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isValidEmail } from '@/lib/validation';
import '@/styles/pages.css';
import '@/features/auth/components/LoginForm.css';

export function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Simulate sending recovery email
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="page page--full-height">
        <div className="page__content">
          <h1 className="page__title">Check Your Email</h1>
          <p className="page__subtitle" data-testid="recovery-success-message">
            We sent email with recovery link to your email.
          </p>
          <p>
            <Link to="/login" className="page__link">
              Back to Login
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page page--full-height">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h1 className="login-form__title">Forgot Password</h1>
        <p className="login-form__subtitle">
          Enter your email address and we'll send you a recovery link.
        </p>

        {error && (
          <div className="login-form__api-error" role="alert" data-testid="forgot-password-error">
            {error}
          </div>
        )}

        <div className="login-form__field">
          <label htmlFor="email" className="login-form__label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`login-form__input ${error ? 'login-form__input--error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            aria-invalid={!!error}
          />
        </div>

        <button type="submit" className="login-form__submit">
          Send Recovery Link
        </button>

        <p className="login-form__footer">
          <Link to="/login" className="login-form__link">
            Back to Login
          </Link>
        </p>
      </form>
    </main>
  );
}
