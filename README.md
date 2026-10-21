# FixAssure — Local Backend Stage 1

Desktop-first prototype for IT operations assurance. This stage adds a local-only Node.js API, SQLite persistence for Pilot Scorecard targets, and an audit trail for scorecard updates. Incident data and AI evidence explanations remain synthetic and frontend-seeded.

## Requirements
- Node.js 20+ (Node.js 22 LTS or newer recommended) and npm.

## Run locally
1. Open Command Prompt in this project folder.
2. Run `npm install`. This installs the frontend and backend dependencies.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal (normally `http://127.0.0.1:5173`). Keep the terminal running while using the app.
5. Open **Pilot Scorecard**, change a target, and click **Save targets**. Refresh the page; the saved target should reload.

The API listens only on `127.0.0.1:8787`. The SQLite database is stored at `%USERPROFILE%\.fixassure\fixassure-demo.sqlite` on Windows (or `~/.fixassure/fixassure-demo.sqlite` on other platforms). It is outside the source folder so a code update does not overwrite local demo settings.

## API endpoints
- `GET /api/health` — local service health.
- `GET /api/scorecard` — saved targets and agreement flag.
- `PUT /api/scorecard` — validates and saves target settings; records before/after values in audit history.
- `GET /api/audit-events?limit=25` — recent audit events (maximum 100).

## Build check
Run `npm run build`.

## Important security boundary
This is a local development implementation, not a production-ready multi-user service. There is no authentication, authorization, tenant isolation, or production hardening. The API binds to loopback only and must not be exposed publicly. Use synthetic demo data only. Before a hosted client pilot, add authentication, role-based authorization, tenant scoping in every query, PostgreSQL migrations, secrets management, backups, monitoring, and security review.

## Documentation
See `ARCHITECTURE.md`, `HOSTING_COMPARISON.md`, `DEVELOPMENT_ROADMAP.md`, `SECURITY_READINESS_CHECKLIST.md`, `PRODUCT_REQUIREMENTS.md`, and `PILOT_SCORECARD.md`.


### Windows installation note
This Stage 1 package uses Node.js's built-in `node:sqlite` module rather than a native npm SQLite addon, avoiding the Visual Studio C++ build-tools requirement that can affect `better-sqlite3` installation on Windows. Node.js 22.13 or newer is required; Node.js 24 LTS is recommended. Node may display an experimental-module warning for `node:sqlite`.

## Stage 2 multi-tenant foundation
See `STAGE2_MULTI_TENANT_README.md` and `STAGE2_DELIVERY_CHECKLIST.md`. Stage 2 adds a separate PostgreSQL tenant API; the existing local SQLite demo remains unchanged. The tenant API is not production-ready and is not yet connected to the current React login/session flow.
