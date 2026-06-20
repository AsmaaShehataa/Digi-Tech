# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Digi-Tech is a static marketing site plus a Flask + SQLite admin backend, both served by `admin_backend.py`. There is no Node.js, Docker, or build step.

### Services

| Service | Port | Command |
|---------|------|---------|
| Full stack (public + admin + APIs) | 5000 | `APP_DEPLOY_TARGET=admin_internal APP_PORT=5000 python3 admin_backend.py` |
| Public site only (static) | 8080 | `python3 -m http.server 8080` |

For local development, use a single Flask process with `APP_DEPLOY_TARGET=admin_internal` — this is the simplest way to test everything end-to-end.

### Default admin credentials (local)

- Email: `admin@digi-tech.local`
- Password: `ChangeMe123!`

### Lint / test / build

No lint, test, or build scripts are configured in this repo. Manual smoke tests:

```bash
curl http://localhost:5000/api/public/health
curl -X POST http://localhost:5000/api/public/inquiries \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"Test","email":"test@example.com","message":"Hello"}'
```

### Gotchas

- Admin routes (`/admin`, `/api/admin/*`) return 404 unless `APP_DEPLOY_TARGET=admin_internal`.
- SQLite database is auto-created at `data/admin_dashboard.db` on first run.
- `pip install` puts the `flask` CLI in `~/.local/bin`, which may not be on PATH; use `python3 admin_backend.py` instead.
