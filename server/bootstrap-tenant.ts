import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const { DATABASE_URL, BOOTSTRAP_ORG_NAME, BOOTSTRAP_ORG_SLUG, BOOTSTRAP_ADMIN_EMAIL,
  BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_NAME } = process.env;

if (!DATABASE_URL || !BOOTSTRAP_ORG_NAME || !BOOTSTRAP_ORG_SLUG ||
    !BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD || !BOOTSTRAP_ADMIN_NAME) {
  console.error("Set DATABASE_URL, BOOTSTRAP_ORG_NAME, BOOTSTRAP_ORG_SLUG, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD, and BOOTSTRAP_ADMIN_NAME.");
  process.exit(1);
}
if (BOOTSTRAP_ADMIN_PASSWORD.length < 14) {
  console.error("Bootstrap password must be at least 14 characters.");
  process.exit(1);
}
const email = BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("BOOTSTRAP_ADMIN_EMAIL is not a valid email format.");
  process.exit(1);
}
const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });
try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orgResult = await client.query(
      `INSERT INTO organizations (name, slug) VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`, [BOOTSTRAP_ORG_NAME, BOOTSTRAP_ORG_SLUG.toLowerCase()]);
    const orgId = orgResult.rows[0].id as string;
    const hash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, 12);
    const userResult = await client.query(
      `INSERT INTO app_users (email, password_hash, display_name) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name, status = 'active'
       RETURNING id`, [email, hash, BOOTSTRAP_ADMIN_NAME]);
    const userId = userResult.rows[0].id as string;
    await client.query(
      `INSERT INTO memberships (organization_id, user_id, role, status) VALUES ($1, $2, 'org_admin', 'active')
       ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'org_admin', status = 'active'`,
      [orgId, userId]);
    await client.query("SELECT set_config('app.current_org_id', $1, true)", [orgId]);
    await client.query(
      `INSERT INTO scorecard_settings (organization_id) VALUES ($1) ON CONFLICT (organization_id) DO NOTHING`,
      [orgId]);
    await client.query("COMMIT");
    console.log(`Bootstrap complete. Organization slug: ${BOOTSTRAP_ORG_SLUG.toLowerCase()}; admin email: ${email}`);
    console.log("Remove bootstrap environment variables from your shell/secret store after use.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} catch (error) {
  console.error("Bootstrap failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
