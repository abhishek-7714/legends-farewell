// Turns raw submissions into leaderboards, per-person tagline lists and the
// palcard CSV. Pure functions: easy to test without a database.

/** Competition ranking (1, 1, 3) over [name, count] pairs sorted desc. */
function rankCounts(counts) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  let rank = 0;
  let prev = null;
  return sorted.map(([name, votes], i) => {
    if (votes !== prev) rank = i + 1;
    prev = votes;
    return { name, votes, rank };
  });
}

function buildLeaderboard(cfg, submissions) {
  return cfg.awards.map((award) => {
    const counts = {};
    let total = 0;
    for (const s of submissions) {
      const nominee = s.awards && s.awards[award.id];
      if (nominee && cfg.memberSet.has(nominee)) {
        counts[nominee] = (counts[nominee] || 0) + 1;
        total += 1;
      }
    }
    const ranked = rankCounts(counts);
    // Show everyone ranked 1-3, so a tie on 3rd shows all tied people.
    const top = ranked.filter((r) => r.rank <= 3);
    const winners = ranked.filter((r) => r.rank === 1);
    const tiedRanks = [...new Set(top.map((r) => r.rank))].filter(
      (rank) => top.filter((r) => r.rank === rank).length > 1
    );
    return {
      id: award.id,
      title: award.title,
      emoji: award.emoji,
      description: award.description,
      totalVotes: total,
      top,
      winners: winners.map((w) => w.name),
      tieForFirst: winners.length > 1,
      tiedRanks,
    };
  });
}

function buildPeople(cfg, submissions, taglines) {
  const subByVoter = new Map(submissions.map((s) => [s.voter, s]));
  return cfg.members.map((name) => {
    const own = subByVoter.get(name);
    return {
      name,
      submitted: Boolean(own),
      selfTagline: own && own.self_tagline ? own.self_tagline : '',
      selfHidden: Boolean(own && own.self_hidden),
      received: taglines
        .filter((t) => t.target === name)
        .map((t) => ({ id: t.id, from: t.voter, text: t.text, hidden: t.hidden })),
    };
  });
}

function buildSummary(cfg, data, votingOpen) {
  const { submissions, taglines } = data;
  const submittedSet = new Set(submissions.map((s) => s.voter));
  return {
    sectionName: cfg.sectionName,
    votingOpen,
    counts: {
      submitted: submissions.filter((s) => cfg.memberSet.has(s.voter)).length,
      total: cfg.members.length,
      taglines: taglines.length,
      hiddenTaglines: taglines.filter((t) => t.hidden).length,
    },
    pending: cfg.members.filter((m) => !submittedSet.has(m)),
    leaderboard: buildLeaderboard(cfg, submissions),
    people: buildPeople(cfg, submissions, taglines),
    notes: submissions
      .filter((s) => s.note)
      .map((s) => ({ from: s.voter, text: s.note, hidden: s.note_hidden, at: s.updated_at })),
    submissions: submissions.map((s) => ({ voter: s.voter, updatedAt: s.updated_at })),
  };
}

// --- CSV -------------------------------------------------------------------

function csvCell(value) {
  let s = value == null ? '' : String(value);
  // Stop spreadsheet apps from treating a cell as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(cfg, data) {
  const leaderboard = buildLeaderboard(cfg, data.submissions);
  const people = buildPeople(cfg, data.submissions, data.taglines);
  const header = ['Name', 'Self tagline', 'Taglines received', 'Tagline count', 'Awards won', 'Award votes'];
  const rows = people.map((p) => {
    const visible = p.received.filter((t) => !t.hidden).map((t) => t.text);
    const won = leaderboard
      .filter((a) => a.winners.includes(p.name) && a.totalVotes > 0)
      .map((a) => (a.tieForFirst ? `${a.title} (tie)` : a.title));
    const votes = leaderboard
      .map((a) => {
        const entry = a.top.find((t) => t.name === p.name);
        return entry ? `${a.title}: ${entry.votes}` : null;
      })
      .filter(Boolean);
    return [
      p.name,
      p.selfHidden ? '' : p.selfTagline,
      visible.join(' | '),
      visible.length,
      won.join(' | '),
      votes.join(' | '),
    ];
  });
  // BOM so Excel opens Hindi/emoji text as UTF-8.
  return '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

module.exports = { rankCounts, buildLeaderboard, buildSummary, buildCsv, csvCell };
