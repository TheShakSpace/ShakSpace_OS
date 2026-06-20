# Shak Space Backend (Production-ready architecture scaffold)

## Features implemented
- Express server skeleton with:
  - helmet
  - cors (credentials + allowlist)
  - morgan
  - cookie-parser
- MongoDB Atlas connection (mongoose)
- Central error handling
- JWT auth middleware supporting:
  - httpOnly cookie tokens (primary)
  - Authorization Bearer fallback
- Auth controller with:
  - register
  - login
  - refresh token rotation
  - logout
- Route structure mounted at `/api/v1`
- Domain route modules stubbed for Workspaces/Knowledge/AI/Automations/Notifications/Settings

## Run locally
1) Create `.env` from `.env.example`
2) Install deps
   - `npm i`
3) Start
   - `npm run start`

Health: `GET /health`

## JWT cookies
- `accessToken`: httpOnly Secure/SameSite cookie
- `refreshToken`: httpOnly Secure/SameSite cookie (rotated on refresh)

