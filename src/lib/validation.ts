import type { ValidationErrors } from '@/types/auth';

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates login form fields
 */
export function validateLoginForm(email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password.trim()) {
    errors.password = 'Password is required';
  }

  return errors;
}

/**
 * Checks if validation errors object has any errors
 */
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
