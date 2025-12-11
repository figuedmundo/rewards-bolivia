/**
 * Email validation utility
 * Uses RFC 5322 simplified regex pattern for email format validation
 */

/**
 * Validates email address format
 * @param email Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Simplified RFC 5322 compliant email regex
  // Matches most common valid email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}
