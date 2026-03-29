/**
 * Maps Firebase Auth error codes to translation keys.
 * @param code The Firebase Auth error code.
 * @returns The translation key for the error message.
 */
export const mapAuthCodeToKey = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'auth.errors.emailAlreadyInUse';
    case 'auth/invalid-email':
      return 'auth.errors.invalidEmail';
    case 'auth/user-disabled':
      return 'auth.errors.userDisabled';
    case 'auth/user-not-found':
      return 'auth.errors.userNotFound';
    case 'auth/wrong-password':
      return 'auth.errors.wrongPassword';
    case 'auth/invalid-credential':
      return 'auth.errors.invalidCredential';
    case 'auth/weak-password':
      return 'auth.errors.weakPassword';
    case 'auth/network-request-failed':
      return 'auth.errors.networkRequestFailed';
    case 'auth/too-many-requests':
      return 'auth.errors.tooManyRequests';
    case 'auth/operation-not-allowed':
      return 'auth.errors.operationNotAllowed';
    default:
      return 'auth.errors.default';
  }
};

/**
 * Extracts the error code from a Firebase Auth error or generic error.
 * @param err The error object.
 * @returns The Firebase Auth error code or a generic fallback.
 */
export const getAuthErrorCode = (err: any): string => {
  // Firebase errors typically have a 'code' property
  if (err && typeof err.code === 'string') {
    return err.code;
  }
  
  // If it's a generic error but message contains the code in parentheses
  // (e.g. "Firebase: Error (auth/email-already-in-use).")
  const match = err?.message?.match(/\((auth\/[^)]+)\)/);
  if (match && match[1]) {
    return match[1];
  }

  return 'unknown';
};
