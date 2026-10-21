# Backend implementation boundary

The API is not implemented in this starter documentation package yet. This folder reserves the intended service boundary and prevents the frontend from becoming coupled to a hosting provider.

Planned service: Node.js + TypeScript. Planned storage modes: SQLite locally and PostgreSQL for hosted multi-user deployments. The first implementation should deliver health, scorecard settings, and audit events only; incident-system connectors and live AI are later, separately governed capabilities.

Do not deploy an unauthenticated write endpoint publicly. Keep synthetic demo data only until authentication, authorization, tenant isolation, backups, and security review are complete.
