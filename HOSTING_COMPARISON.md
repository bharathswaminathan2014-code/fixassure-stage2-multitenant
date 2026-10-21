# FixAssure Hosting Evaluation — Provider Neutral

Decision: do not select a hosting vendor yet. First make the app portable and document the runtime requirements. Re-evaluate vendors against current pricing and contractual/security requirements immediately before deployment.

| Option | Useful for | Advantages | Risks / checks | Current decision |
|---|---|---|---|---|
| Render | Simple web service plus managed PostgreSQL | Straightforward deployment workflow | Free services may sleep; free database offerings may be temporary/limited; verify current persistence, backups, regions, and plan limits | Candidate for demo |
| Railway | Quick full-stack deployment | Fast setup and integrated services | Usage-based costs/credits and persistent database price must be checked | Candidate for demo |
| Cloudflare Pages/Workers | Static marketing site and edge APIs | Good static-site delivery and free entry tier | Different runtime constraints from a conventional Node server; confirm API/database compatibility before choosing | Candidate for marketing site, not assumed for API |
| Azure | Enterprise environments and Microsoft ecosystem | Broad enterprise controls and procurement options | More configuration and potentially higher operational cost | Revisit when a pilot customer's requirements are known |
| Self-hosted Docker on a VPS | Portability and control | Predictable base infrastructure and fewer platform abstractions | Owner must manage OS patching, TLS, backups, monitoring, uptime and recovery | Not recommended as the first public deployment without operations support |

## Comparison criteria

Before committing, score each candidate for: total monthly cost (app, database, storage, egress, backups, logs, email/domain, taxes), data region, data processing terms, encryption, identity and secrets handling, backup retention and restore testing, service availability, scaling, support, deployment rollback, observability, vendor exit/export path, and any customer procurement requirements.

Free tiers are suitable only for synthetic demos. Do not put customer incident data, credentials, or sensitive operational records into the demo environment.

## Domain approach

Keep the domain registrar separate from hosting where practical. Use a single consulting domain with a product subdomain if the final brand and domain availability checks pass. Brand/domain availability and trademark clearance have not been verified. Do not purchase a domain until spelling, renewal pricing, DNS access, and ownership are confirmed.
