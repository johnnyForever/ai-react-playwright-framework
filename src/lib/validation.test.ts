import { describe, expect, it } from 'vitest';
import { hasErrors, isValidEmail, validateLoginForm } from './validation';

describe('validation', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
      expect(isValidEmail('a@b.co')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('no@.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
      expect(isValidEmail('double@@at.com')).toBe(false);
    });
  });

  describe('validateLoginForm', () => {
    it('should return empty errors for valid input', () => {
      const errors = validateLoginForm('test@example.com', 'password123');
      expect(errors).toEqual({});
    });

    it('should return email required error for empty email', () => {
      const errors = validateLoginForm('', 'password123');
      expect(errors.email).toBe('Email is required');
      expect(errors.password).toBeUndefined();
    });

    it('should return email required error for whitespace-only email', () => {
      const errors = validateLoginForm('   ', 'password123');
      expect(errors.email).toBe('Email is required');
    });

    it('should return invalid email error for invalid format', () => {
      const errors = validateLoginForm('notvalidemail', 'password123');
      expect(errors.email).toBe('Please enter a valid email address');
    });

    it('should return password required error for empty password', () => {
      const errors = validateLoginForm('test@example.com', '');
      expect(errors.password).toBe('Password is required');
      expect(errors.email).toBeUndefined();
    });

    it('should return password required error for whitespace-only password', () => {
      const errors = validateLoginForm('test@example.com', '   ');
      expect(errors.password).toBe('Password is required');
    });

    it('should return both errors when both fields are invalid', () => {
      const errors = validateLoginForm('', '');
      expect(errors.email).toBe('Email is required');
      expect(errors.password).toBe('Password is required');
    });

    it('should return email format error and password required error', () => {
      const errors = validateLoginForm('invalid', '');
      expect(errors.email).toBe('Please enter a valid email address');
      expect(errors.password).toBe('Password is required');
    });
  });

  describe('hasErrors', () => {
    it('should return false for empty errors object', () => {
      expect(hasErrors({})).toBe(false);
    });

    it('should return true when email error exists', () => {
      expect(hasErrors({ email: 'Email is required' })).toBe(true);
    });

    it('should return true when password error exists', () => {
      expect(hasErrors({ password: 'Password is required' })).toBe(true);
    });

    it('should return true when both errors exist', () => {
      expect(hasErrors({ email: 'Email is required', password: 'Password is required' })).toBe(
        true,
      );
    });
  });
});
