# Stage 1 implementation notes

Implemented in this package:
- Local Express API with health endpoint.
- SQLite-backed Pilot Scorecard settings.
- Server-side validation of all five scorecard targets (integer 0–100).
- Audit records containing before/after scorecard values and timestamps.
- Frontend loads saved scorecard values and provides an explicit Save targets button.
- Vite development proxy keeps browser requests same-origin.
- API binds to loopback only.

Not implemented yet:
- PostgreSQL adapter/migrations.
- Authentication, users, roles, organizations, or tenant isolation.
- Audit UI, incident persistence, connectors, live AI, production deployment.

Run `npm install`, then `npm run dev`; in a second step run `npm run build` if you want a separate verification. Do not use real customer data.


Windows compatibility adjustment: database access uses Node.js built-in `node:sqlite` to avoid compiling a native npm addon during installation. Requires Node.js 22.13+; no Visual Studio C++ toolchain is needed for the SQLite dependency.
