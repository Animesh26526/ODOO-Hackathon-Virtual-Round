// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Validation functions
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email.trim()) {
    return { valid: false, error: "Email is required" }
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: "Please enter a valid email address" }
  }
  return { valid: true }
}

export function validatePassword(password: string, minLength = 6): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: "Password is required" }
  }
  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` }
  }
  return { valid: true }
}

export function validatePasswordMatch(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" }
  }
  return { valid: true }
}
