# Product Requirements — Incident-to-Permanent-Fix Assurance

## Product objective
Help IT operations leaders detect and manage gaps between service restoration and sustainable remediation using deterministic governance rules and evidence-grounded AI assistance.

## Initial target
Mid-sized enterprises using ServiceNow or Jira Service Management. Initial workflows: P1/P2 incidents and recurring service failures.

## User roles
- Executive sponsor: views aggregate assurance metrics and material risk.
- Incident manager: reviews restoration and incident linkage.
- Problem manager: reviews root cause, evidence and remediation.
- Change/release owner: confirms implementation and verification evidence.
- Platform administrator: configures policy thresholds and approved integrations.

## MVP scope
1. Executive overview
2. Searchable case register
3. Assurance record and lifecycle timeline
4. AI evidence review (demo only until model integration is approved)
5. Remediation exceptions
6. Assurance report
7. Pilot scorecard
8. Consulting package and discovery checklist

## Lifecycle states
- Restored: service is operating again; underlying cause may remain.
- Contained: immediate impact is controlled, but residual risk remains.
- Remediation in progress: corrective work is active and not yet verified.
- Verified permanent fix: required evidence and agreed verification criteria are met.
- Risk accepted: an authorized owner accepts residual risk. This does not mean the defect is eliminated.

## Governance rules
- Configure policy for when incident-to-problem linkage is required; default demo rule flags P1/P2 and repeated incidents when missing.
- Flag missing owner, overdue milestones, repeated symptoms, long-lived workaround, unsupported or disputed RCA, missing verification, and deferral without a review date.
- Never treat incident closure as proof of problem closure.
- Never label a root cause as confirmed without evidence and human approval.
- Do not require a change record when the customer policy legitimately does not require one; require a rationale.
- Separate verified remediation from authorized risk acceptance.
- Preserve source reference, timestamp, model/rule version and human decision history for material findings.

## AI requirements
- Cite source record IDs or evidence references for material findings.
- Distinguish facts, hypotheses, contradictions and missing evidence.
- Never invent records or citations.
- Treat ticket content as untrusted input.
- No autonomous production changes in MVP.
- Show confidence limitations and route ambiguous findings to human review.

## Security requirements before real customer data
- Authentication and role-based access
- Tenant isolation enforced in API and database
- Least-privilege integration identities
- Encryption in transit and at rest
- Secret management and audit logging
- Data minimization, redaction and retention policy
- Approved model/data-processing arrangements
- Backup, recovery and vulnerability management
- Customer-approved data processing and security review

## Out of scope for MVP
- Replacing an ITSM system
- Autonomous production remediation
- Guaranteed root-cause identification
- Universal ITSM connectors
- Compliance or certification claims
- Claims of customer demand or competitive superiority without evidence

## Commercial hypothesis
Consulting-led product development:
1. ITSM Assurance Diagnostic: indicative ₹35k–₹75k, 1–2 weeks.
2. Governance Improvement: indicative ₹1L–₹2.5L, 3–6 weeks.
3. AI Assurance Pilot: indicative ₹1.5L–₹4L, 4–6 weeks.
These prices are hypotheses to validate, not established market rates.
