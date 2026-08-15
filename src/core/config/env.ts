/**
 * App configuration. Flip USE_MOCK_API to false when the Go backend is ready.
 * Default API base matches BarberSaas-be (`:8088`).
 *
 * Railway / Expo public vars (EXPO_PUBLIC_*):
 * - EXPO_PUBLIC_API_BASE_URL
 * - EXPO_PUBLIC_USE_MOCK_API
 * - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
 * - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (optional)
 * - EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (optional)
 */
export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8088',
  apiPrefix: '/api/v1',
  /** When true, DI wires mock services. Set false to use HTTP adapters. */
  useMockApi: (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') === 'true',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
} as const;
