/**
 * App configuration. Flip USE_MOCK_API to false when the Go backend is ready.
 * Default API base matches BarberSaas-be (`:8088`).
 */
export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8088',
  apiPrefix: '/api/v1',
  /** When true, DI wires mock services. Set false to use HTTP adapters. */
  useMockApi: (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') === 'true',
} as const;
