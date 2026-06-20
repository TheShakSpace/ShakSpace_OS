# Backend Implementation TODO (Shak Space)

## Step 1 — Create backend folder + package
- [ ] Create `backend/package.json`
- [ ] Add scripts (`dev`, `start`, `lint`), main entry

## Step 2 — Implement production Express skeleton
- [ ] `src/server.js`
- [ ] `src/app.js`
- [ ] `helmet`, `cors (credentials)`, `morgan`, `express.json`, `cookie-parser`

## Step 3 — Environment + config
- [ ] `src/config/env.js` (dotenv validation)
- [ ] `src/config/config.js`

## Step 4 — MongoDB Atlas connection
- [ ] `src/config/db.js` with retries + graceful shutdown hooks

## Step 5 — Logging + error handling
- [ ] `src/utils/logger.js`
- [ ] `src/utils/AppError.js`
- [ ] `src/middleware/errorHandler.js`

## Step 6 — Response helpers + validation wrappers
- [ ] `src/utils/response.js`
- [ ] `src/validators/validate.js`
- [ ] Route validators for auth

## Step 7 — Auth (JWT) with cookies + bearer
- [ ] Models: `User`, refresh token storage (embedded/collection)
- [ ] `src/services/authService.js`
- [ ] JWT utils: sign/verify
- [ ] `src/middleware/authJwt.js` (cookie primary + bearer fallback)
- [ ] refresh rotation + logout

## Step 8 — Role middleware
- [ ] roles util + `requireRole`

## Step 9 — Domain models + services + controllers
- [ ] Workspaces, Knowledge, AI Conversations, Automations, Notifications, Settings

## Step 10 — Routes
- [ ] `src/routes/index.js` + versioned mounting at `/api/v1`
- [ ] route modules per domain

## Step 11 — Multer + Cloudinary upload service (for knowledge/attachments)
- [ ] multer config
- [ ] cloudinary upload service

## Step 12 — Basic boot test
- [ ] `node backend/src/server.js` starts without frontend connection
- [ ] Smoke-test health endpoint

