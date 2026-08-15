import {
  AuthRequest,
  Prompt,
  ResponseType,
  makeRedirectUri,
} from 'expo-auth-session';
import { discovery } from 'expo-auth-session/providers/google';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { env } from '../../../core/config/env';
import type {
  GoogleSignInResult,
  GoogleSignInService,
} from './GoogleSignInService';

WebBrowser.maybeCompleteAuthSession();

/**
 * Interactive Google OAuth via Expo AuthSession (ID token flow).
 * Backend verifies the token — never trust the client alone.
 */
export class ExpoGoogleSignInService implements GoogleSignInService {
  isConfigured(): boolean {
    return Boolean(
      env.googleWebClientId || env.googleIosClientId || env.googleAndroidClientId,
    );
  }

  async signIn(): Promise<GoogleSignInResult> {
    const clientId =
      Platform.OS === 'ios'
        ? env.googleIosClientId || env.googleWebClientId
        : Platform.OS === 'android'
          ? env.googleAndroidClientId || env.googleWebClientId
          : env.googleWebClientId;

    if (!clientId) {
      throw new Error('Google girişi yapılandırılmamış');
    }

    const nonceBytes = await Crypto.getRandomBytesAsync(16);
    const nonce = Array.from(nonceBytes, (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('');

    const redirectUri =
      Platform.OS === 'web'
        ? makeRedirectUri({ preferLocalhost: true })
        : makeRedirectUri({
            scheme: 'barbersaas',
            path: 'oauth',
          });

    const request = new AuthRequest({
      clientId,
      redirectUri,
      scopes: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      responseType: ResponseType.IdToken,
      usePKCE: false,
      prompt: Prompt.SelectAccount,
      extraParams: {
        nonce,
        hl: 'tr',
      },
    });

    const result = await request.promptAsync(discovery);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Google girişi iptal edildi');
    }
    if (result.type !== 'success') {
      throw new Error('Google girişi başarısız');
    }

    const idToken = result.params.id_token;
    if (!idToken) {
      throw new Error('Google kimlik jetonu alınamadı');
    }

    return { idToken };
  }
}
