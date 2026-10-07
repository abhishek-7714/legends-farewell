// PostgreSQL access. On Replit, DATABASE_URL is set automatically once you add
// the built-in PostgreSQL database to the Repl.
const crypto = require('crypto');
const { Pool } = require('pg');

let pool = null;

function isConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    pool = new Pool({
      connectionString: url,
      // Replit's managed Postgres requires TLS; a local Docker instance doesn't.
      ssl: local || /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

async function migrate() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS submissions (
      voter        TEXT PRIMARY KEY,
      token_hash   TEXT NOT NULL,
      awards       JSONB NOT NULL DEFAULT '{}'::jsonb,
      self_tagline TEXT,
      self_hidden  BOOLEAN NOT NULL DEFAULT false,
      note         TEXT,
      note_hidden  BOOLEAN NOT NULL DEFAULT false,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS taglines (
      id         SERIAL PRIMARY KEY,
      voter      TEXT NOT NULL REFERENCES submissions(voter) ON DELETE CASCADE,
      target     TEXT NOT NULL,
      text       TEXT NOT NULL,
      hidden     BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS taglines_target_idx ON taglines(target);
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );
    INSERT INTO settings(key, value) VALUES ('voting_open', 'true'::jsonb) ON CONFLICT DO NOTHING;
  `);
}

const hashToken = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');
const newToken = () => crypto.randomBytes(24).toString('hex');

function tokenMatches(token, hash) {
  if (!token || !hash) return false;
  const a = Buffer.from(hashToken(token), 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function isVotingOpen() {
  const { rows } = await getPool().query(`SELECT value FROM settings WHERE key = 'voting_open'`);
  return rows.length ? rows[0].value === true : true;
}

async function setVotingOpen(open) {
  await getPool().query(
    `INSERT INTO settings(key, value) VALUES ('voting_open', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(Boolean(open))]
  );
}

async function getSubmissionStatus(voter) {
  const { rows } = await getPool().query(`SELECT token_hash FROM submissions WHERE voter = $1`, [voter]);
  return rows[0] || null;
}

async function getSubmission(voter, token) {
  const db = getPool();
  const { rows } = await db.query(`SELECT * FROM submissions WHERE voter = $1`, [voter]);
  const sub = rows[0];
  if (!sub || !tokenMatches(token, sub.token_hash)) return null;
  const tl = await db.query(`SELECT target, text FROM taglines WHERE voter = $1 ORDER BY id`, [voter]);
  return {
    voter: sub.voter,
    awards: sub.awards,
    selfTagline: sub.self_tagline || '',
    note: sub.note || '',
    taglines: tl.rows,
    updatedAt: sub.updated_at,
  };
}

/**
 * Insert or replace a voter's submission inside one transaction.
 * Returns { ok, token } or { ok: false, reason: 'locked' } when the name was
 * already used from another device (no matching edit token).
 */
async function saveSubmission(sub, token) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT token_hash FROM submissions WHERE voter = $1 FOR UPDATE`,
      [sub.voter]
    );
    let outToken = token;
    if (rows.length) {
      if (!tokenMatches(token, rows[0].token_hash)) {
        await client.query('ROLLBACK');
        return { ok: false, reason: 'locked' };
      }
      await client.query(
        `UPDATE submissions SET awards = $2, self_tagline = $3, note = $4, updated_at = now()
         WHERE voter = $1`,
        [sub.voter, sub.awards, sub.selfTagline, sub.note]
      );
    } else {
      outToken = newToken();
      await client.query(
        `INSERT INTO submissions(voter, token_hash, awards, self_tagline, note) VALUES ($1, $2, $3, $4, $5)`,
        [sub.voter, hashToken(outToken), sub.awards, sub.selfTagline, sub.note]
      );
    }

    // Replace taglines, but keep an admin's "hidden" decision for any tagline
    // that survives the edit unchanged.
    const prev = await client.query(
      `SELECT target, text FROM taglines WHERE voter = $1 AND hidden`,
      [sub.voter]
    );
    const hiddenKeys = new Set(prev.rows.map((r) => `${r.target}\u0000${r.text}`));
    await client.query(`DELETE FROM taglines WHERE voter = $1`, [sub.voter]);
    for (const t of sub.taglines) {
      await client.query(
        `INSERT INTO taglines(voter, target, text, hidden) VALUES ($1, $2, $3, $4)`,
        [sub.voter, t.target, t.text, hiddenKeys.has(`${t.target}\u0000${t.text}`)]
      );
    }
    await client.query('COMMIT');
    return { ok: true, token: outToken };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

async function getAllData() {
  const db = getPool();
  const subs = await db.query(
    `SELECT voter, awards, self_tagline, self_hidden, note, note_hidden, created_at, updated_at
     FROM submissions ORDER BY updated_at DESC`
  );
  const tls = await db.query(`SELECT id, voter, target, text, hidden, created_at FROM taglines ORDER BY target, id`);
  return { submissions: subs.rows, taglines: tls.rows };
}

async function setTaglineHidden(id, hidden) {
  const r = await getPool().query(`UPDATE taglines SET hidden = $2 WHERE id = $1`, [id, Boolean(hidden)]);
  return r.rowCount > 0;
}

async function setSubmissionFieldHidden(voter, field, hidden) {
  const col = field === 'self' ? 'self_hidden' : 'note_hidden';
  const r = await getPool().query(`UPDATE submissions SET ${col} = $2 WHERE voter = $1`, [voter, Boolean(hidden)]);
  return r.rowCount > 0;
}

async function deleteSubmission(voter) {
  const r = await getPool().query(`DELETE FROM submissions WHERE voter = $1`, [voter]);
  return r.rowCount > 0;
}

module.exports = {
  isConfigured,
  migrate,
  isVotingOpen,
  setVotingOpen,
  getSubmissionStatus,
  getSubmission,
  saveSubmission,
  getAllData,
  setTaglineHidden,
  setSubmissionFieldHidden,
  deleteSubmission,
};
