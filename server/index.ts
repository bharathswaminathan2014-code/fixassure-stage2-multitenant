import express from "express";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const app = express();
const host = "127.0.0.1"; // Deliberately local-only; do not expose this unauthenticated API publicly.
const port = Number(process.env.API_PORT ?? 8787);
const dataDir = process.env.FIXASSURE_DATA_DIR ?? path.join(os.homedir(), ".fixassure");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "fixassure-demo.sqlite");
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
db.exec(`
  CREATE TABLE IF NOT EXISTS scorecard_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    targets_json TEXT NOT NULL,
    methodology_agreed INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);
const defaults = { precision: "80", recall: "90", traceability: "100", timeSaved: "30", actionable: "70" };
const existing = db.prepare("SELECT id FROM scorecard_settings WHERE id = 1").get() as { id: number } | undefined;
if (!existing) {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO scorecard_settings (id, targets_json, methodology_agreed, updated_at) VALUES (1, ?, 0, ?)").run(JSON.stringify(defaults), now);
  db.prepare("INSERT INTO audit_events (event_type, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, ?, ?)")
    .run("created", "scorecard", "pilot-defaults", JSON.stringify({ targets: defaults, methodologyAgreed: false, source: "initial defaults" }), now);
}
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "fixassure-local-api", storage: "sqlite", mode: "local-demo-only" });
});

app.get("/api/scorecard", (_req, res) => {
  const row = db.prepare("SELECT targets_json, methodology_agreed, updated_at FROM scorecard_settings WHERE id = 1").get() as
    { targets_json: string; methodology_agreed: number; updated_at: string } | undefined;
  if (!row) return res.status(500).json({ error: "Scorecard settings are not initialized" });
  res.json({ targets: JSON.parse(row.targets_json), methodologyAgreed: Boolean(row.methodology_agreed), updatedAt: row.updated_at });
});

app.put("/api/scorecard", (req, res) => {
  const body = req.body as { targets?: Record<string, unknown>; methodologyAgreed?: unknown };
  const keys = ["precision", "recall", "traceability", "timeSaved", "actionable"];
  if (!body || !body.targets || typeof body.targets !== "object" || Array.isArray(body.targets)) {
    return res.status(400).json({ error: "targets must be an object" });
  }
  const targets: Record<string, string> = {};
  for (const key of keys) {
    const raw = body.targets[key];
    const value = typeof raw === "number" || typeof raw === "string" ? String(raw) : "";
    if (!/^\d{1,3}$/.test(value) || Number(value) < 0 || Number(value) > 100) {
      return res.status(400).json({ error: `Target '${key}' must be a whole number from 0 to 100` });
    }
    targets[key] = value;
  }
  if (typeof body.methodologyAgreed !== "boolean") {
    return res.status(400).json({ error: "methodologyAgreed must be true or false" });
  }
  const previous = db.prepare("SELECT targets_json, methodology_agreed FROM scorecard_settings WHERE id = 1").get() as
    { targets_json: string; methodology_agreed: number } | undefined;
  if (!previous) return res.status(500).json({ error: "Scorecard settings are not initialized" });
  const now = new Date().toISOString();
  const next = { targets, methodologyAgreed: body.methodologyAgreed };
  try {
    db.exec("BEGIN");
    db.prepare("UPDATE scorecard_settings SET targets_json = ?, methodology_agreed = ?, updated_at = ? WHERE id = 1")
      .run(JSON.stringify(targets), body.methodologyAgreed ? 1 : 0, now);
    db.prepare("INSERT INTO audit_events (event_type, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, ?, ?)")
      .run("updated", "scorecard", "pilot-targets", JSON.stringify({
        before: { targets: JSON.parse(previous.targets_json), methodologyAgreed: Boolean(previous.methodology_agreed) },
        after: next
      }), now);
    db.exec("COMMIT");
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch { /* transaction may already have ended */ }
    console.error("Unable to save scorecard settings", error);
    return res.status(500).json({ error: "Unable to save scorecard settings" });
  }
  res.json({ ...next, updatedAt: now });
});

app.get("/api/audit-events", (req, res) => {
  const requested = Number(req.query.limit ?? 25);
  const limit = Number.isFinite(requested) ? Math.max(1, Math.min(100, Math.floor(requested))) : 25;
  const rows = db.prepare("SELECT id, event_type AS eventType, entity_type AS entityType, entity_id AS entityId, details_json AS detailsJson, created_at AS createdAt FROM audit_events ORDER BY id DESC LIMIT ?")
    .all(limit) as Array<{ id: number; eventType: string; entityType: string; entityId: string; detailsJson: string; createdAt: string }>;
  res.json({ events: rows.map(row => ({
    id: row.id, eventType: row.eventType, entityType: row.entityType, entityId: row.entityId,
    details: JSON.parse(row.detailsJson), createdAt: row.createdAt
  })) });
});

app.listen(port, host, () => {
  console.log(`FixAssure local API listening at http://${host}:${port}`);
  console.log(`SQLite database: ${dbPath}`);
  console.log("Local demo only. No authentication is configured; do not expose this API to a network.");
});
