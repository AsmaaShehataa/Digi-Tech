# Admin Dashboard Architecture

This document describes the new centralized admin system for project and payment operations.

## High-level flow

1. **Admin opens `/admin`**
2. Dashboard loads overview + projects from API:
   - `GET /api/admin/overview`
   - `GET /api/admin/projects`
3. Admin creates projects through the input form:
   - `POST /api/admin/projects`
4. System automatically calculates:
   - remaining balance
   - payment progress
   - overdue/pending milestones
   - deadline urgency
   - portfolio financial summaries
5. Admin exports or shares reports:
   - `GET /api/admin/export.csv`
   - `GET /api/admin/export.json`
   - `POST /api/admin/share-report`

## Backend modules

- `admin_backend.py`
  - Flask route handlers
  - SQLite repository and schema initialization
  - financial/operational metrics engine
  - reporting/export logic
- `templates/admin_dashboard.html`
  - dashboard UI layout and workflow
- `static/admin.js`
  - UI state management, API integration, render logic
- `static/admin.css`
  - modern dashboard styling

## Database schema (SQLite)

### `projects`

- `id` (PK)
- `client_name` (TEXT, required)
- `project_name` (TEXT, required)
- `total_price` (REAL, required)
- `paid_amount` (REAL, required)
- `start_date` (TEXT ISO date)
- `deadline` (TEXT ISO date)
- `status` (TEXT: planned, in_progress, on_hold, completed, cancelled)
- `notes` (TEXT optional)
- `created_at`, `updated_at`

### `payment_milestones`

- `id` (PK)
- `project_id` (FK → projects.id)
- `title` (TEXT, required)
- `due_date` (TEXT ISO date)
- `amount` (REAL, required)
- `paid` (INTEGER boolean)
- `paid_date` (TEXT optional)
- `created_at`

## Route map

### UI routes

- `GET /` → public website
- `GET /admin` → admin dashboard

### API routes

- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `GET /api/admin/projects/<project_id>`
- `PATCH /api/admin/projects/<project_id>`
- `GET /api/admin/overview`
- `GET /api/admin/export.csv`
- `GET /api/admin/export.json`
- `POST /api/admin/share-report`

## Automated logic

For each project, API responses include computed metrics:

- `remaining_balance`
- `payment_progress`
- `days_remaining`
- `deadline_state` (on_track, upcoming, overdue)
- `pending_milestones_count`
- `overdue_milestones_count`
- `next_due_milestone`
- `effective_status` (auto-completes when fully paid unless cancelled)

Portfolio-level summary includes:

- total/active/completed projects
- pending & overdue payment counts/amounts
- upcoming deadlines (next 14 days)
- total contract value, paid, remaining
- portfolio payment progress percentage
