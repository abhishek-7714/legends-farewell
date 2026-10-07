// Server-side validation for survey submissions. The client does the same
// checks for friendliness, but only this file is trusted.
const sanitizeHtml = require('sanitize-html');

const LIMITS = {
  tagline: 60,
  note: 1000,
  maxTaglines: 80,
};

// Strip all HTML, collapse whitespace, trim. Text is always rendered with
// textContent on the client too, so this is belt and braces.
function cleanText(value, max) {
  if (value == null) return '';
  let s = sanitizeHtml(String(value), { allowedTags: [], allowedAttributes: {} });
  // sanitize-html leaves entities encoded; decode the common ones so the
  // stored text is plain (what gets printed on palcards).
  s = s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  s = s.replace(/<\/?[a-zA-Z!][^>]*>/g, ''); // anything that decoded back into a tag (keeps "<3")
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return max ? Array.from(s).slice(0, max).join('') : s;
}

function charLen(s) {
  return Array.from(s).length;
}

/**
 * @returns {{ ok: true, value } | { ok: false, error: string }}
 */
function validateSubmission(body, cfg) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Empty submission.' };

  const voter = typeof body.voter === 'string' ? body.voter.trim() : '';
  if (!cfg.memberSet.has(voter)) return { ok: false, error: 'Pick your own name from the list first.' };

  // Awards: { awardId: nomineeName }. Unknown ids and blanks are dropped.
  const awards = {};
  const rawAwards = body.awards && typeof body.awards === 'object' ? body.awards : {};
  for (const [id, nominee] of Object.entries(rawAwards)) {
    if (!cfg.awardIds.has(id)) continue;
    if (nominee == null || nominee === '') continue;
    const name = String(nominee).trim();
    if (!cfg.memberSet.has(name)) return { ok: false, error: `Unknown classmate for an award: "${cleanText(name, 40)}".` };
    if (name === voter) return { ok: false, error: 'Nice try. You cannot vote for yourself.' };
    awards[id] = name;
  }

  // Taglines for friends.
  const taglines = [];
  const rawTaglines = Array.isArray(body.taglines) ? body.taglines : [];
  if (rawTaglines.length > LIMITS.maxTaglines) {
    return { ok: false, error: `That is a lot of taglines. Max ${LIMITS.maxTaglines}.` };
  }
  const dedupe = new Set();
  for (const t of rawTaglines) {
    if (!t || typeof t !== 'object') continue;
    const target = typeof t.target === 'string' ? t.target.trim() : '';
    const text = cleanText(t.text);
    if (!target && !text) continue; // empty row
    if (!cfg.memberSet.has(target)) return { ok: false, error: 'Every tagline needs a classmate picked from the list.' };
    if (target === voter) return { ok: false, error: 'Your own tagline goes in the "for yourself" box.' };
    if (!text) return { ok: false, error: `The tagline for ${target} is empty.` };
    if (charLen(text) > LIMITS.tagline) {
      return { ok: false, error: `Tagline for ${target} is over ${LIMITS.tagline} characters. Palcards are small!` };
    }
    const key = `${target}\u0000${text.toLowerCase()}`;
    if (dedupe.has(key)) continue;
    dedupe.add(key);
    taglines.push({ target, text });
  }

  const selfTagline = cleanText(body.selfTagline);
  if (charLen(selfTagline) > LIMITS.tagline) {
    return { ok: false, error: `Your own tagline is over ${LIMITS.tagline} characters.` };
  }
  const note = cleanText(body.note);
  if (charLen(note) > LIMITS.note) return { ok: false, error: `Note is over ${LIMITS.note} characters.` };

  return { ok: true, value: { voter, awards, taglines, selfTagline: selfTagline || null, note: note || null } };
}

module.exports = { validateSubmission, cleanText, LIMITS };
