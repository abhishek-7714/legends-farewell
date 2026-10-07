// Loads and sanity-checks the editable content files in /data.
// Everything a non-developer should change lives in those JSON files, not here.
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const MAX_AWARDS = 15;

function readJson(name) {
  const file = path.join(DATA_DIR, name);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`Could not read data/${name}: ${err.message}`);
  }
}

function loadConfig() {
  const section = readJson('section.json');
  const awardsFile = readJson('awards.json');
  const story = readJson('story.json');

  const members = (section.members || []).map((n) => String(n).trim()).filter(Boolean);
  const seen = new Set();
  for (const name of members) {
    const key = name.toLowerCase();
    if (seen.has(key)) throw new Error(`data/section.json: duplicate name "${name}"`);
    seen.add(key);
  }
  if (members.length === 0) throw new Error('data/section.json: "members" is empty');

  const awards = (awardsFile.awards || []).map((a) => ({
    id: String(a.id || '').trim(),
    title: String(a.title || '').trim(),
    description: String(a.description || '').trim(),
    emoji: a.emoji ? String(a.emoji) : '',
  }));
  if (awards.length > MAX_AWARDS) {
    throw new Error(`data/awards.json: ${awards.length} awards, max is ${MAX_AWARDS}`);
  }
  const ids = new Set();
  for (const a of awards) {
    if (!/^[a-z0-9-]+$/.test(a.id)) throw new Error(`data/awards.json: bad id "${a.id}" (use lowercase letters, digits, dashes)`);
    if (ids.has(a.id)) throw new Error(`data/awards.json: duplicate id "${a.id}"`);
    ids.add(a.id);
    // Titles go on palcards, so keep them short. Warn rather than crash.
    if (a.title.split(/\s+/).length > 3) console.warn(`[config] award "${a.title}" is longer than 3 words`);
  }

  return {
    sectionName: section.sectionName || 'Legends',
    members,
    memberSet: new Set(members),
    awards,
    awardIds: ids,
    story,
  };
}

module.exports = { loadConfig };
