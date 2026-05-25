# SkincareAI Mobile

Expo React Native mobile app for SkincareAI.

## Stack

- Expo SDK `~54.0.32`
- Expo Router
- NativeWind
- React Query
- Zustand
- Axios
- Reanimated

## Current Scope

This scaffold covers:

- app foundation and routing
- premium design system
- auth session handling
- backend API client
- onboarding and auth screens
- protected consumer tab shell
- subscription-backed home placeholders

The app is designed against the currently implemented backend endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/subscriptions/me`
- `GET /api/subscriptions/usage`
- `POST /api/analysis/start`
- `GET /api/analysis/history`
- `GET /api/analysis/:id`

## Setup

1. Install dependencies:

```powershell
npm.cmd install
```

2. Create a local env file:

```powershell
Copy-Item .env.example .env
```

Default API base URL:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.skincare-ai.gr/api
```

3. Start the app:

```powershell
npm.cmd run start
```

## APK Build

This app is configured for Android APK builds with EAS.

Android application id:

```text
com.skincareai.mobile
```

### Internal / preview APK

```powershell
npx eas build --platform android --profile preview
```

### Production APK

```powershell
npx eas build --platform android --profile production-apk
```

### Production Play Store bundle

```powershell
npx eas build --platform android --profile production
```

## Notes

- `preview` now builds an APK for device testing.
- `production-apk` builds a release APK directly.
- `production` remains available for Play Store style builds if you later want an Android App Bundle.
- The app reads the API base URL from `EXPO_PUBLIC_API_BASE_URL`, with the current production API URL also present in Expo config as a fallback.
