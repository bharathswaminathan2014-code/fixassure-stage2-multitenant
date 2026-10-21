import express, { type NextFunction, type Request, type Response } from "express";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const { Pool } = pg;
const app = express();
const host = process.env.API_HOST ?? "127.0.0.1";
const port = Number(process.env.API_PORT ?? 8788);
const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

if (!databaseUrl) throw new Error("DATABASE_URL is required for the tenant API.");
if (!jwtSecret || jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters. Use a secret manager outside local development.");

const pool = new Pool({
  connectionString: databaseUrl,
  max: Number(process.env.PG_POOL_MAX ?? 10),
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: true } : undefined
});
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

type AuthContext = { userId: string; organizationId: string; role: string; email: string };
type AuthedRequest = Request & { auth?: AuthContext };

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

async function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return res.status(401).json({ error: "Authentication required" });
  try {
    const claims = jwt.verify(match[1], jwtSecret!, { issuer: "fixassure", audience: "fixassure-api" }) as jwt.JwtPayload;
    if (typeof claims.sub !== "string" || typeof claims.org !== "string") {
      return res.status(401).json({ error: "Invalid session token" });
    }
    const result = await pool.query(
      `SELECT u.id AS "userId", u.email, m.organization_id AS "organizationId", m.role
       FROM app_users u
       JOIN memberships m ON m.user_id = u.id
       JOIN organizations o ON o.id = m.organization_id
       WHERE u.id = $1 AND m.organization_id = $2
         AND u.status = 'active' AND m.status = 'active' AND o.status = 'active'`,
      [claims.sub, claims.org]
    );
    if (!result.rowCount) return res.status(401).json({ error: "Account or organization membership is inactive" });
    req.auth = result.rows[0] as AuthContext;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }
}

async function tenantTransaction<T>(organizationId: string, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.current_org_id', $1, true)", [organizationId]);
    const value = await fn(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function validateTargets(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  const keys = ["precision", "recall", "traceability", "timeSaved", "actionable"];
  const result: Record<string, string> = {};
  for (const key of keys) {
    const raw = record[key];
    const value = typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
    if (!/^\d{1,3}$/.test(value) || Number(value) < 0 || Number(value) > 100) return null;
    result[key] = value;
  }
  return result;
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", service: "fixassure-tenant-api", storage: "postgresql", mode: "stage2-development" });
  } catch {
    res.status(503).json({ status: "unavailable", service: "fixassure-tenant-api" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const organizationSlug = typeof req.body?.organizationSlug === "string" ? req.body.organizationSlug.trim().toLowerCase() : "";
  if (!email || !password || !organizationSlug) return res.status(400).json({ error: "email, password, and organizationSlug are required" });
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, m.organization_id, m.role, o.slug, o.name AS organization_name
       FROM app_users u
       JOIN memberships m ON m.user_id = u.id
       JOIN organizations o ON o.id = m.organization_id
       WHERE u.email = $1 AND o.slug = $2 AND u.status = 'active'
         AND m.status = 'active' AND o.status = 'active'`,
      [email, organizationSlug]
    );
    const user = result.rows[0];
    const passwordOk = user ? await bcrypt.compare(password, user.password_hash) : await bcrypt.compare(password, "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy");
    if (!user || !passwordOk) return res.status(401).json({ error: "Invalid credentials or organization" });
    const token = jwt.sign({ org: user.organization_id, jti: crypto.randomUUID() }, jwtSecret!, {
      subject: user.id, expiresIn: "15m", issuer: "fixassure", audience: "fixassure-api"
    });
    res.json({
      accessToken: token, tokenType: "Bearer", expiresInSeconds: 900,
      user: { id: user.id, email: user.email, role: user.role },
      organization: { id: user.organization_id, slug: user.slug, name: user.organization_name }
    });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).json({ error: "Unable to sign in" });
  }
});

app.get("/api/me", authenticate, (req: AuthedRequest, res) => {
  res.json({ user: { id: req.auth!.userId, email: req.auth!.email, role: req.auth!.role },
    organization: { id: req.auth!.organizationId } });
});

app.get("/api/scorecard", authenticate, async (req: AuthedRequest, res) => {
  try {
    const result = await tenantTransaction(req.auth!.organizationId, async client => {
      await client.query(
        `INSERT INTO scorecard_settings (organization_id) VALUES ($1) ON CONFLICT (organization_id) DO NOTHING`,
        [req.auth!.organizationId]);
      const row = await client.query(
        `SELECT targets_json AS targets, methodology_agreed AS "methodologyAgreed", updated_at AS "updatedAt"
         FROM scorecard_settings WHERE organization_id = $1`, [req.auth!.organizationId]);
      return row.rows[0];
    });
    res.json(result);
  } catch (error) {
    console.error("Scorecard read failed", error);
    res.status(500).json({ error: "Unable to load scorecard" });
  }
});

app.put("/api/scorecard", authenticate, async (req: AuthedRequest, res) => {
  const targets = validateTargets(req.body?.targets);
  if (!targets) return res.status(400).json({ error: "All five targets must be whole numbers from 0 to 100" });
  if (typeof req.body?.methodologyAgreed !== "boolean") return res.status(400).json({ error: "methodologyAgreed must be true or false" });
  try {
    const result = await tenantTransaction(req.auth!.organizationId, async client => {
      await client.query(`INSERT INTO scorecard_settings (organization_id) VALUES ($1) ON CONFLICT (organization_id) DO NOTHING`, [req.auth!.organizationId]);
      const previousResult = await client.query(
        `SELECT targets_json AS targets, methodology_agreed AS "methodologyAgreed" FROM scorecard_settings WHERE organization_id = $1 FOR UPDATE`,
        [req.auth!.organizationId]);
      const previous = previousResult.rows[0];
      const next = { targets, methodologyAgreed: req.body.methodologyAgreed };
      const updated = await client.query(
        `UPDATE scorecard_settings SET targets_json = $2::jsonb, methodology_agreed = $3, updated_by = $4, updated_at = now()
         WHERE organization_id = $1 RETURNING targets_json AS targets, methodology_agreed AS "methodologyAgreed", updated_at AS "updatedAt"`,
        [req.auth!.organizationId, JSON.stringify(targets), req.body.methodologyAgreed, req.auth!.userId]);
      await client.query(
        `INSERT INTO audit_events (organization_id, actor_user_id, event_type, entity_type, entity_id, details_json)
         VALUES ($1, $2, 'updated', 'scorecard', 'pilot-targets', $3::jsonb)`,
        [req.auth!.organizationId, req.auth!.userId, JSON.stringify({ before: previous, after: next })]);
      return updated.rows[0];
    });
    res.json(result);
  } catch (error) {
    console.error("Scorecard update failed", error);
    res.status(500).json({ error: "Unable to save scorecard" });
  }
});

app.get("/api/audit-events", authenticate, async (req: AuthedRequest, res) => {
  const requested = Number(req.query.limit ?? 25);
  const limit = Number.isFinite(requested) ? Math.max(1, Math.min(100, Math.floor(requested))) : 25;
  try {
    const events = await tenantTransaction(req.auth!.organizationId, async client => {
      const result = await client.query(
        `SELECT id, actor_user_id AS "actorUserId", event_type AS "eventType", entity_type AS "entityType",
          entity_id AS "entityId", details_json AS details, created_at AS "createdAt"
         FROM audit_events WHERE organization_id = $1 ORDER BY id DESC LIMIT $2`,
        [req.auth!.organizationId, limit]);
      return result.rows;
    });
    res.json({ events });
  } catch (error) {
    console.error("Audit read failed", error);
    res.status(500).json({ error: "Unable to load audit events" });
  }
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.listen(port, host, () => {
  console.log(`FixAssure tenant API listening at http://${host}:${port}`);
  console.log("PostgreSQL multi-tenant API. Use synthetic data only until security review is complete.");
});
