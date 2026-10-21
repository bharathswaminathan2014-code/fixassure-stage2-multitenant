# FixAssure — Provider-Neutral Architecture

Status: architecture decision for the next development stage. This document describes the intended design; it does not claim that the backend, database persistence, authentication, or production security controls have already been implemented.

## Goals

- Keep the existing React + TypeScript + Vite interface.
- Add a backend API so the browser never connects directly to a database.
- Support local development without requiring a cloud account.
- Keep deployment portable across hosting vendors.
- Support shared records and settings across multiple authorized users in the hosted version.
- Preserve an auditable history of policy/scorecard changes and human review decisions.
- Keep the demo synthetic until security controls are reviewed.

## Logical architecture

Browser (React/Vite) → HTTPS API (Node.js + TypeScript) → repository/data-access layer → database.

The API owns validation, authentication/authorization, tenant scoping, business rules, audit events, and data access. The browser only calls API endpoints. Database credentials remain server-side.

## Technology choices

- Frontend: existing React 19 + TypeScript + Vite.
- API: Node.js + TypeScript + Express (initial proposal; HTTP framework is replaceable).
- Data access: repository interface, so business rules do not depend on the database vendor.
- Local development database: SQLite, one local developer/process at a time.
- Hosted shared database: PostgreSQL. Use managed PostgreSQL where practical; PostgreSQL is portable between providers.
- Schema changes: versioned migrations committed to the repository.
- Configuration: environment variables; secrets never committed to source control.
- Deployment packaging: Docker-compatible application services where practical; no cloud-specific SDK in core business logic.

SQLite and PostgreSQL have different concurrency and SQL behavior. The implementation must use a tested adapter/migration strategy; changing a connection string alone is not considered a complete migration plan.

## Initial API contract (proposed)

- `GET /api/health` — liveness only; no secrets or database details in response.
- `GET /api/v1/scorecard` — fetch scorecard settings for the authenticated tenant/workspace.
- `PUT /api/v1/scorecard` — validate and save settings, record actor, timestamp, version and audit event.
- `GET /api/v1/audit-events` — authorized, paginated audit history.

For an unauthenticated local prototype, scorecard routes must be explicitly marked development-only and disabled in a public deployment until authentication and tenant authorization are added. Do not expose an unauthenticated write API to the public internet.

## Data model (initial proposal)

- `workspaces`: workspace/tenant identity and lifecycle.
- `users`: identity-provider subject and account status (passwords should not be stored by the app if using a trusted identity provider).
- `workspace_memberships`: user, workspace, role, status.
- `scorecard_settings`: workspace, metric key, target value, version, updated by, updated at.
- `audit_events`: workspace, actor, action, entity type/id, timestamp, request/correlation ID, safe change summary.

All tenant-owned tables require a workspace/tenant key. Every API query and write must enforce the current user's workspace membership server-side. Never rely on a workspace ID supplied by the browser as authorization.

## Provider neutrality rules

1. No provider-specific imports in domain/business logic.
2. Keep configuration in environment variables and document required variables in `.env.example` without real secrets.
3. Use standard PostgreSQL and exportable formats; provide backup and restore procedures.
4. Keep uploaded files out of ephemeral app filesystems; if file uploads are added, use an object-storage interface and a portable S3-compatible implementation.
5. Avoid provider-only authentication, queues, or databases in the core path unless isolated behind interfaces.
6. Document provider-specific deployment instructions separately from application code.

## Environments

- `local-demo`: synthetic data; local API and SQLite; no sensitive data.
- `hosted-demo`: synthetic data; API plus persistent database if saved cross-user state is demonstrated; limited access.
- `pilot`: separate workspace per customer, authentication, role permissions, tenant isolation tests, backups, monitoring, incident response and customer security approval before any customer data is loaded.

## Not yet implemented

The uploaded project is currently a frontend prototype. It has no backend API, database persistence, authentication, tenant isolation, or live AI inference. The Pilot Scorecard's current React state is not shared across users and does not survive a reload. This document is a design decision, not evidence those features exist.
