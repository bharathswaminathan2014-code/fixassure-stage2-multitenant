# FixAssure Security Readiness Checklist

Do not treat the demo as production-ready until the applicable items below are implemented and tested.

## Before any public write API
- [ ] Authentication is enabled; no public unauthenticated write routes.
- [ ] Role-based authorization is enforced on the server for every route.
- [ ] Tenant/workspace isolation is enforced on reads, writes, exports, and background jobs.
- [ ] Request payloads are schema-validated and size-limited.
- [ ] Rate limiting and safe error responses are configured.
- [ ] Secrets are injected through deployment settings, not committed to Git.
- [ ] HTTPS is enforced and secure headers are configured.
- [ ] Dependency and vulnerability checks run before release.
- [ ] Audit events capture material setting changes and human decisions without logging secrets or unnecessary personal data.

## Before a customer pilot
- [ ] Written data classification and approved data-processing approach.
- [ ] Customer-approved identity/access model and tenant boundaries.
- [ ] Database backups and a tested restore procedure.
- [ ] Retention, deletion, export, and incident-response procedures.
- [ ] Logging/monitoring and alert ownership.
- [ ] Security testing, including cross-tenant access tests.
- [ ] Approved integration credentials with least privilege; read-only access by default.
- [ ] AI provider/model, data use, retention, citations, and human-review behavior approved before enabling live AI.
- [ ] Customer security/legal review completed before real data is loaded.

## AI governance guardrails
- Treat ticket content and connected records as untrusted input.
- Cite source records and distinguish facts, hypotheses, contradictions, and missing evidence.
- Do not fabricate records or citations.
- Do not autonomously change production systems.
- Preserve human review and decision history.
- A restored incident is not proof of a permanent fix; risk acceptance is not defect elimination.
