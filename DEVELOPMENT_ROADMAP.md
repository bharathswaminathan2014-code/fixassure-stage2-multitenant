# FixAssure Development Roadmap

## Stage 0 — Preserve the known-good prototype
- Keep the existing UI and synthetic data working.
- Run `npm install` and `npm run build` from the project root after source changes.
- Never upload `.env` files, credentials, `node_modules`, or generated `dist` output to the source archive.

## Stage 1 — Local backend foundation
- Create a separate `server/` TypeScript service.
- Add a repository/data-access interface and a local SQLite implementation.
- Add versioned schema migrations and health endpoint.
- Add scorecard read/save with validation, version numbers and audit events.
- Integrate the Pilot Scorecard UI with the API and show clear save/error states.
- Add API tests for validation, persistence after restart, and audit events.
- Keep any unauthenticated local write routes bound to localhost and explicitly development-only.

## Stage 2 — PostgreSQL and multi-user foundations
- Add and test PostgreSQL repository/migrations.
- Add authentication and server-side role authorization.
- Add workspaces/tenant model and cross-tenant isolation tests.
- Add audit review, backup/restore and deployment configuration.
- Test concurrent updates and define conflict behavior.

## Stage 3 — Hosting selection and deployment
- Compare actual vendor plan details and data regions at deployment time.
- Deploy synthetic demo first; test cold starts, persistent storage, rollback, logs, and backups.
- Add custom domain after brand/domain availability and renewal price are confirmed.

## Stage 4 — Pilot readiness
- Security review, privacy/data processing review, customer-specific acceptance criteria, support procedures, and explicit approval before using customer data.

## Completion evidence
For every stage, record build/test results, known limitations, and a list of implemented versus planned features. Do not describe a design document as a completed implementation.
