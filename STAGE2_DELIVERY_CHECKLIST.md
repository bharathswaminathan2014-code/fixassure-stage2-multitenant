# Stage 2 multi-tenant delivery checklist

## Foundation added in this package
- [x] PostgreSQL schema for organizations, users, memberships, scorecard settings, audit events, incident case foundation, evidence foundation
- [x] Tenant-specific PostgreSQL row-level security policies for tenant data tables
- [x] Login API with password hashes and short-lived signed access tokens
- [x] Active organization membership is rechecked on protected API requests
- [x] Scorecard reads/writes and audit events are scoped to the authenticated organization
- [x] Bootstrap script runs locally and does not expose a public bootstrap route
- [x] Stage 1 SQLite demo remains separate

## Next implementation tasks
- [ ] Install dependencies and run server TypeScript check
- [ ] Apply migration to a disposable PostgreSQL database and verify constraints/policies
- [ ] Add automated tests for cross-tenant read/write/export attempts
- [ ] Add login UI and token handling to the React frontend; avoid persistent localStorage for long-lived secrets
- [ ] Add invitation-based membership management and role-permission matrix
- [ ] Add rate limiting, lockout protections, password reset, MFA/SSO option, session revocation
- [ ] Use a dedicated least-privilege PostgreSQL role; test RLS with this role
- [ ] Add versioned migrations and backup/restore test
- [ ] Connect incident/evidence data to tenant-scoped persistent APIs
- [ ] Run independent security review before production data
