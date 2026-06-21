# Shakspace_OS - MongoDB Atlas Debug/Fix

## Step 1: Gather info
- [x] Inspect backend Mongo connection code (`backend/src/config/db.js`)
- [x] Inspect env loader (`backend/src/config/env.js`)
- [x] Inspect where bootstrap connects Mongo (`backend/src/app.js`, `backend/src/server.js`)

## Step 2: Plan fix
- [ ] Add temporary debug logging before `mongoose.connect()` (mask credentials)
- [ ] Verify URI normalization produces a string starting with `mongodb+srv://`
- [ ] Ensure dotenv loads `.env` from backend root reliably

## Step 3: Implement fix (backend config only)
- [ ] Patch `backend/src/config/env.js` to load correct `.env` path deterministically
- [ ] Patch `backend/src/config/db.js` to log loaded URI and validate scheme
- [ ] Remove temporary debug logs after successful connection

## Step 4: Verification
- [ ] Start backend and confirm terminal prints:
  - Connected to MongoDB Atlas
  - Backend listening on port 5000

