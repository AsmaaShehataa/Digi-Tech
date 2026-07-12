# Hostinger Deployment Guide (Node + React + Express)

## 1) Build locally or on server

```bash
npm install
npm --prefix client install
npm --prefix server install
npm run build
```

## 2) Configure environment

Copy `server/.env.example` to `server/.env` and set production values:

- `PORT` (internal app port, e.g. 5000)
- `APP_DEPLOY_TARGET=admin_internal` (or `public`)
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `PUBLIC_API_ALLOWED_ORIGINS`
- `ADMIN_ALLOWED_IPS` (optional)

## 3) Start app

```bash
npm start
```

For resilient production process management, use PM2:

```bash
npm install -g pm2
pm2 start npm --name digi-tech -- start
pm2 save
```

## 4) Reverse proxy

Configure Hostinger/Nginx to forward your domain to `http://127.0.0.1:<PORT>`.

## 5) Verify

- `GET /api/public/health`
- Login at `/admin`
- Check project + change-request CRUD

## 6) Optional split mode

If you want public site and admin service isolated:

- Run two Node services with different `APP_DEPLOY_TARGET` and ports
- Route by subdomain in reverse proxy
