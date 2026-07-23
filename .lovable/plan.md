
## Healthcare & Health Monitoring Platform

A LocalStorage-only PWA with two panels: Patient app and Admin dashboard. No backend, no database — all data lives in the browser.

### Scope (v1)

**Auth**
- Register / login / logout with role (USER, ADMIN)
- Password hashed via Web Crypto SHA-256 (not real security — clearly labeled demo)
- Session in localStorage; protected routes via TanStack Router `beforeLoad`
- Seeded default admin: `admin@demo.local` / `admin123`

**Patient panel** (`/dashboard`, `/health`, `/medicine`, `/appointments`, `/records`, `/fitness`, `/nutrition`, `/sleep`, `/emergency`, `/profile`, `/settings`)
- Dashboard: health summary cards + charts (BP, sugar, weight, sleep trend)
- Health metrics: log BP, blood sugar, weight/BMI, heart rate
- Medicines: CRUD + daily schedule + reminder toggle
- Appointments: CRUD with status (Pending/Approved/Completed/Cancelled)
- Records: upload files (stored as base64 in localStorage, size-capped)
- Fitness / Nutrition / Sleep: simple log + chart
- Emergency profile: blood group, allergies, conditions, contacts
- Profile & settings (theme, notifications)

**Admin panel** (`/admin/*`)
- Dashboard: system stats + charts (users, activities, appointments, meds)
- Users: table, search, activate/deactivate, delete, reset password
- Health monitoring: pick user → view their timeline & metrics, add admin notes
- Appointments: view all, change status, delete
- Medications: view all user meds, delete
- Medical records: preview/download/delete
- Notifications: broadcast to all or selected users
- Content: health articles CRUD (publish/unpublish)
- Reports: generate + export JSON / CSV
- Settings: app name, theme defaults, categories
- Activity logs: filter, search, clear
- Backup: export full localStorage as JSON; restore from JSON upload

**Cross-cutting**
- Activity logger writes to `activity_logs` on key events
- Dark/light theme toggle (class on `<html>`)
- Responsive layout with shadcn sidebar
- Recharts for all charts
- PWA: manifest + icons (installable, no offline SW per platform default)

### Design

- Clean medical SaaS aesthetic: calm teal/blue primary, soft neutrals, generous whitespace
- Semantic tokens in `src/styles.css` (oklch); no hardcoded colors in components
- Shadcn components; sidebar layout for both panels
- Distinct visual chrome for admin (darker sidebar accent) vs patient

### Routes structure

```
src/routes/
  __root.tsx
  index.tsx              → public landing + CTA to login/register
  login.tsx
  register.tsx
  _user/
    route.tsx            → gate: requires USER session, wraps sidebar
    dashboard.tsx
    health.tsx
    medicine.tsx
    appointments.tsx
    records.tsx
    fitness.tsx
    nutrition.tsx
    sleep.tsx
    emergency.tsx
    profile.tsx
    settings.tsx
  _admin/
    route.tsx            → gate: requires ADMIN session, wraps admin shell
    admin.dashboard.tsx
    admin.users.tsx
    admin.health-monitoring.tsx
    admin.appointments.tsx
    admin.medications.tsx
    admin.medical-records.tsx
    admin.notifications.tsx
    admin.content.tsx
    admin.reports.tsx
    admin.settings.tsx
    admin.activity-logs.tsx
    admin.backup.tsx
```

### Storage layer

Single `src/lib/storage.ts` module exposing typed getters/setters for each key (`users`, `health_records`, `medications`, `appointments`, `medical_documents`, `health_metrics`, `activity_logs`, `notifications`, `system_settings`, `reports`, `articles`, `session`). All mutations funnel through helpers that also append to `activity_logs`.

### Technical notes

- TanStack Start + TanStack Router (project stack; no react-router-dom)
- All state client-side; use Zustand-free approach — thin React context for auth + direct storage reads with a small `useStorage` hook that subscribes to a custom event on writes
- File uploads capped at ~2MB each, warn user about localStorage quota (~5MB)
- Recharts for charts
- PWA: manifest only (installable), no service worker per platform default

### Explicit non-goals for v1

- No real cryptography / real auth (demo-only, clearly labeled)
- No offline service worker (installable manifest only)
- No external integrations (HealthKit, Twilio, OpenAI, etc.)
- No multi-admin roles beyond ADMIN
- No PDF export (JSON + CSV only)

### Deliverable

One large build. I'll scaffold storage, auth, layout, then patient pages, then admin pages, wire charts, add PWA manifest, and seed a demo admin + a sample user with some data so both dashboards look alive on first load.
