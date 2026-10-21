# FixAssure Stage 2 — Multi-tenant foundation

This is a development foundation for multiple client organizations with separate users and tenant-scoped data. It preserves the Stage 1 SQLite demo and adds a separate PostgreSQL API path.

## Included
- `server/migrations/001_multi_tenant.sql`: organizations, users, memberships, per-organization scorecard settings, audit events, incident/evidence table foundations, and PostgreSQL row-level security policies.
- `server/tenant-api.ts`: PostgreSQL API with password login, short-lived JWT access tokens, active membership lookup on protected requests, tenant-scoped scorecard CRUD and audit retrieval.
- `server/migrate-tenant.ts`: applies the initial schema to a dedicated PostgreSQL database.
- `server/bootstrap-tenant.ts`: creates the first organization and organization administrator from environment variables.
- Existing Stage 1 local SQLite application remains available via `npm run dev`.

## Important status
This is a Stage 2 development foundation, **not production-ready software**. The current React UI has not yet been connected to the tenant login/token flow; Stage 1 frontend calls the unauthenticated local SQLite API. The tenant API is a separate service and must be tested independently. No client data should be used.

## Prerequisites
- Node.js 24 LTS/current compatible release
- PostgreSQL 15 or newer (local development or a private managed database)
- Use a new, dedicated development database. Do not point this migration at the Stage 1 SQLite file or a production database.

## Install
```cmd
npm install
```
This adds `pg`, `bcryptjs`, and `jsonwebtoken`. Existing Stage 1 still runs using `npm run dev`.

## Configure in Command Prompt (temporary local shell only)
Set values for the current Command Prompt session. Use your own database credentials and a random secret of at least 32 characters; do not commit secrets to files or screenshots.
```cmd
set DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/fixassure_stage2
set JWT_SECRET=REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
set PGSSLMODE=
```
For a hosted PostgreSQL database, use the provider's connection URL and required TLS configuration. Never expose this database publicly without network restrictions.

## Apply schema and create the first organization
```cmd
npm run migrate:tenant
set BOOTSTRAP_ORG_NAME=FixAssure Demo Organization
set BOOTSTRAP_ORG_SLUG=fixassure-demo
set BOOTSTRAP_ADMIN_EMAIL=admin@example.com
set BOOTSTRAP_ADMIN_PASSWORD=REPLACE_WITH_A_LONG_UNIQUE_PASSWORD
set BOOTSTRAP_ADMIN_NAME=FixAssure Administrator
npm run bootstrap:tenant
```
Use an email you control and a unique password of at least 14 characters. Bootstrap is a one-time operator command; it is not an HTTP endpoint. Afterward clear bootstrap variables from the shell. For local testing:
```cmd
set BOOTSTRAP_ORG_NAME=
set BOOTSTRAP_ORG_SLUG=
set BOOTSTRAP_ADMIN_EMAIL=
set BOOTSTRAP_ADMIN_PASSWORD=
set BOOTSTRAP_ADMIN_NAME=
```

## Run the tenant API
```cmd
npm run dev:tenant-api
```
It listens on `127.0.0.1:8788`. It is intentionally separate from the Stage 1 service on port 8787.

## Test with curl (new Command Prompt)
Health:
```cmd
curl http://127.0.0.1:8788/api/health
```
Login (replace credentials and organization slug):
```cmd
curl -X POST http://127.0.0.1:8788/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"YOUR_PASSWORD\",\"organizationSlug\":\"fixassure-demo\"}"
```
Copy the `accessToken` from the JSON response, then:
```cmd
curl http://127.0.0.1:8788/api/scorecard -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
curl http://127.0.0.1:8788/api/audit-events -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Security limitations before real use
- No self-service sign-up or invitation workflow; user onboarding must be added.
- No refresh-token/revocation system, MFA, rate limiting, account lockout, email verification, password reset, or security event monitoring yet.
- The frontend login/session flow is not implemented in this stage.
- Platform administration and organization lifecycle management are not exposed as public routes.
- Database migrations need version tracking and rollback strategy before production.
- RLS is enabled and forced on tenant-owned tables. Run the API using a dedicated least-privilege database role that is not a superuser and has no `BYPASSRLS`; do not use the migration/owner role for normal API runtime. Independently test RLS policies.
- Configure TLS, secret management, backups, recovery tests, log redaction, dependency scanning, and rate limiting before any public deployment.
- Do not use real incident or customer data until an independent security review approves the deployment.
