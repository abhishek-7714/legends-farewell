const path = require('path');
const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');

const { loadConfig } = require('./config');
const db = require('./db');
const { validateSubmission, LIMITS } = require('./validate');
const { buildSummary, buildCsv } = require('./results');

const cfg = loadConfig();
const app = express();
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Replit (and most hosts) sit behind one proxy; needed for per-IP rate limits.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'same-origin');
  next();
});

// The whole class may share one campus Wi-Fi IP, so limits are generous:
// they stop scripts, not classmates.
const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false });
const submitLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many submissions from this network. Coffee break, then try again in a few minutes.' },
});
const adminAuthLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, skipSuccessfulRequests: true });

app.use('/api', apiLimiter);

function requireDb(req, res, next) {
  if (!db.isConfigured()) {
    return res.status(503).json({ error: 'Database is not set up yet (DATABASE_URL missing). See README.' });
  }
  next();
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- Public API -------------------------------------------------------

app.get('/api/config', wrap(async (req, res) => {
  const votingOpen = db.isConfigured() ? await db.isVotingOpen() : false;
  res.set('Cache-Control', 'no-store');
  res.json({
    sectionName: cfg.sectionName,
    members: cfg.members,
    awards: cfg.awards,
    story: cfg.story,
    votingOpen,
    dbReady: db.isConfigured(),
    limits: { tagline: LIMITS.tagline, note: LIMITS.note },
  });
}));

app.get('/api/status', requireDb, wrap(async (req, res) => {
  const voter = String(req.query.voter || '');
  if (!cfg.memberSet.has(voter)) return res.status(400).json({ error: 'Unknown name.' });
  const row = await db.getSubmissionStatus(voter);
  res.json({ submitted: Boolean(row) });
}));

// POST so the edit token never lands in a URL or access log.
app.post('/api/submission/load', requireDb, wrap(async (req, res) => {
  const { voter, token } = req.body || {};
  if (!cfg.memberSet.has(voter)) return res.status(400).json({ error: 'Unknown name.' });
  const sub = await db.getSubmission(voter, token);
  if (!sub) return res.status(404).json({ error: 'No saved submission on this device.' });
  res.json(sub);
}));

app.post('/api/submit', submitLimiter, requireDb, wrap(async (req, res) => {
  if (!(await db.isVotingOpen())) {
    return res.status(403).json({ error: 'Voting is closed. The Legends have spoken.' });
  }
  const check = validateSubmission(req.body, cfg);
  if (!check.ok) return res.status(400).json({ error: check.error });

  const result = await db.saveSubmission(check.value, req.body.token);
  if (!result.ok) {
    return res.status(409).json({
      error: `${check.value.voter} has already voted from another device. If that was you, open it there, or ask the admin to reset it.`,
    });
  }
  res.json({ ok: true, token: result.token });
}));

// ---------- Admin ------------------------------------------------------------

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(503).send('Admin is disabled: set the ADMIN_PASSWORD secret (see README).');
  }
  const header = req.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (safeEqual(password, expected)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Legends admin", charset="UTF-8"');
  res.status(401).send('Password needed. Username can be anything.');
}

app.get(['/admin', '/admin.html'], adminAuthLimiter, requireAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

const admin = express.Router();

admin.get('/summary', requireDb, wrap(async (req, res) => {
  const [data, open] = await Promise.all([db.getAllData(), db.isVotingOpen()]);
  res.set('Cache-Control', 'no-store');
  res.json(buildSummary(cfg, data, open));
}));

admin.post('/tagline/:id', requireDb, wrap(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });
  const ok = await db.setTaglineHidden(id, Boolean(req.body && req.body.hidden));
  res.status(ok ? 200 : 404).json({ ok });
}));

admin.post('/submission/:voter/hide', requireDb, wrap(async (req, res) => {
  const field = req.body && req.body.field;
  if (field !== 'self' && field !== 'note') return res.status(400).json({ error: 'field must be self or note' });
  const ok = await db.setSubmissionFieldHidden(req.params.voter, field, Boolean(req.body.hidden));
  res.status(ok ? 200 : 404).json({ ok });
}));

admin.delete('/submission/:voter', requireDb, wrap(async (req, res) => {
  const ok = await db.deleteSubmission(req.params.voter);
  res.status(ok ? 200 : 404).json({ ok });
}));

admin.post('/voting', requireDb, wrap(async (req, res) => {
  await db.setVotingOpen(Boolean(req.body && req.body.open));
  res.json({ ok: true, votingOpen: await db.isVotingOpen() });
}));

admin.get('/export.csv', requireDb, wrap(async (req, res) => {
  const data = await db.getAllData();
  const stamp = new Date().toISOString().slice(0, 10);
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="legends-palcards-${stamp}.csv"`);
  res.set('Cache-Control', 'no-store');
  res.send(buildCsv(cfg, data));
}));

app.use('/api/admin', adminAuthLimiter, requireAdmin, admin);

// ---------- Static site -----------------------------------------------------

app.use(express.static(PUBLIC_DIR, {
  index: 'index.html',
  setHeaders(res, file) {
    if (file.endsWith('.html')) res.set('Cache-Control', 'no-cache');
  },
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Something broke on our side. Try again in a minute.' });
});

async function start() {
  if (db.isConfigured()) {
    await db.migrate();
    console.log('[db] connected and migrated');
  } else {
    console.warn('[db] DATABASE_URL not set: the story works, the survey will not save. See README.');
  }
  if (!process.env.ADMIN_PASSWORD) console.warn('[admin] ADMIN_PASSWORD not set: /admin is disabled.');
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => console.log(`Legends running on http://localhost:${port}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
}

module.exports = { app, start };
