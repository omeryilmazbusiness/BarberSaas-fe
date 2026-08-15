import type {
  GoogleSignInResult,
  GoogleSignInService,
} from './GoogleSignInService';

/** Mock adapter for local/demo without Google Console. */
export class MockGoogleSignInService implements GoogleSignInService {
  isConfigured(): boolean {
    return true;
  }

  async signIn(): Promise<GoogleSignInResult> {
    await new Promise((r) => setTimeout(r, 400));
    // Backend mock path is not used when USE_MOCK_API=true —
    // CustomerAuthService mock accepts a fake token marker.
    return { idToken: 'mock-google-id-token' };
  }
}
