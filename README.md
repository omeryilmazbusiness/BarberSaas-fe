# BarberOps — Frontend

Mobile-first Expo (React Native + Web) shop console for the Barber SaaS backend.

## Stack

- Expo 57 · React Native · TypeScript (strict)
- React Navigation (native stack + bottom tabs)
- SOLID-ready service layer (interfaces + mock / HTTP adapters)

## Run

```bash
cd BarberSaas-fe
npm install
npm run web
```

App opens on the Expo web URL (usually `http://localhost:8081`).

## Mock vs live API

Default: **mock services** so the UI runs without the Go API.

| Env | Default | Meaning |
|-----|---------|---------|
| `EXPO_PUBLIC_USE_MOCK_API` | `true` | Use in-memory mock adapters |
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:8088` | Backend base when mock is off |

To wire the real backend:

1. Start BarberSaas-be on `:8088`
2. Create `.env`:

```bash
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_API_BASE_URL=http://localhost:8088
```

3. Restart Expo

Composition root: `src/core/di/container.ts` — flip mock ↔ HTTP without touching screens.

## Demo login (mock)

- Shop slug: `acme-barber`
- Email: `owner@acme.com`
- Password: any

## Business flows covered

1. **Open shop** → `POST /tenants/` then login
2. **Shop login** → JWT session
3. **Admin setup** → users, staff, catalog services
4. **Book** → appointment pending → confirm / cancel

## Architecture

```
src/
  core/          config, HTTP client, auth, DI
  features/      auth, appointments, staff, catalog, users, tenants, dashboard
  shared/        theme, UI, constants
  navigation/    auth + shop tabs + modal creates
```

Screens depend on service **interfaces**; HTTP adapters match backend envelopes (`{ data }`) and paths under `/api/v1`.
