export interface GoogleSignInResult {
  idToken: string;
}

/**
 * Abstraction for Google interactive sign-in (DIP).
 * UI depends on this interface, not Expo AuthSession.
 */
export interface GoogleSignInService {
  isConfigured(): boolean;
  signIn(): Promise<GoogleSignInResult>;
}
