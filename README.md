# Digi-Tech (Node + React + Express)

This repository has been rebuilt on the requested stack:

- **Frontend:** React + Vite (`/client`)
- **Backend:** Express + MongoDB (`/server`)
- **Auth:** Session-based admin authentication
- **Domain model:** Projects, milestones, change requests, inquiries

It keeps the previous business logic for:

- project/payment tracking
- completed project handling (not shown as overdue)
- change requests with deposit + timeline
- staged revenue recognition for change requests

---

## Project Structure

```text
client/                  # React app (public website + admin UI)
server/                  # Express API + MongoDB data layer
  src/repository.js      # core business logic and metrics
  src/app.js             # routes + middleware
  src/index.js           # server bootstrap
```

---

## Database

The API stores everything in MongoDB (Atlas or self-hosted). Set `MONGODB_URI` and
`MONGODB_DB` in `server/.env`; collections and indexes are created automatically on
first boot, along with the default admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

In Atlas, allow your host's outbound IP under **Network Access** (or `0.0.0.0/0` for
platforms with rotating egress IPs).

---

## Local Development

Install dependencies (already separated by app):

```bash
npm install
npm --prefix client install
npm --prefix server install
```

Run frontend + backend together:

```bash
npm run dev
```

- React dev server: `http://localhost:5173`
- Express API: `http://localhost:5001`

---

## Production Build

Build React:

```bash
npm run build
```

Run Express (serves `/api/*` and built React app):

```bash
npm start
```

---

## Environment Variables (Server)

Use `server/.env.example` as the template.

Important:

- `APP_DEPLOY_TARGET=admin_internal` enables admin APIs
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` define initial admin login
- `SESSION_SECRET` should be a long random secret in production
- `PUBLIC_API_ALLOWED_ORIGINS` controls public API CORS
- `ADMIN_ALLOWED_IPS` can enforce internal-only admin access

---

## API Overview

Public:

- `GET /api/public/health`
- `POST /api/public/inquiries`

Admin:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET/POST/PUT/DELETE /api/admin/projects...`
- `GET/POST/PUT/DELETE /api/admin/change-requests...`
- `GET /api/admin/overview`
- `GET /api/admin/export.csv`
- `GET /api/admin/export.json`
- `POST /api/admin/share-report`

---

## Hostinger Notes (Node Deployment)

This stack is Hostinger-friendly for Node-capable plans/VPS:

1. Upload repository
2. Install dependencies
3. Set server env vars
4. Run `npm run build`
5. Start with `npm start` (or process manager like PM2)
6. Reverse proxy with Nginx/Hostinger panel to Express port

If you want, a follow-up can add:

- PM2 ecosystem config
- Dockerfile
- production Nginx config specifically for Hostinger Node apps
