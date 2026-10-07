import { h } from './dom.js';

const $ = (id) => document.getElementById(id);
let data = null;
let busy = false;

async function call(method, url, body) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    location.reload(); // re-prompt for the password
    throw new Error('Not logged in');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

async function refresh() {
  if (busy) return;
  busy = true;
  try {
    data = await call('GET', '/api/admin/summary');
    $('error').hidden = true;
    $('live').classList.remove('is-off');
    render();
  } catch (err) {
    $('error').textContent = err.message;
    $('error').hidden = false;
    $('live').classList.add('is-off');
  } finally {
    busy = false;
  }
}

function render() {
  const { counts, votingOpen } = data;
  $('count-sub').textContent = counts.submitted;
  $('count-total').textContent = counts.total;
  $('meter-fill').style.width = `${(counts.submitted / Math.max(1, counts.total)) * 100}%`;
  $('voting-toggle').checked = votingOpen;
  $('voting-label').textContent = votingOpen ? 'Voting open' : 'Voting closed';
  renderLeaderboard();
  renderTaglines();
  renderNotes();
  renderPeople();
}

function renderLeaderboard() {
  $('tab-leaderboard').replaceChildren(
    h('div.lb-grid',
      data.leaderboard.map((a) => {
        const max = Math.max(1, ...a.top.map((t) => t.votes));
        return h('article.lb-card',
          h('header',
            h('h3', `${a.emoji || ''} ${a.title}`),
            a.tieForFirst ? h('span.badge.badge-tie', 'TIE for 1st') : a.tiedRanks.length ? h('span.badge.badge-soft', `tie at #${a.tiedRanks.join(', #')}`) : null),
          h('p.lb-desc', a.description),
          a.top.length
            ? h('ol.lb-list',
                a.top.map((t) =>
                  h('li', { class: `rank-${t.rank}` },
                    h('span.lb-rank', `#${t.rank}`),
                    h('span.lb-name', t.name),
                    h('span.lb-bar', h('i', { style: { width: `${(t.votes / max) * 100}%` } })),
                    h('span.lb-votes', `${t.votes}`))))
            : h('p.lb-empty', 'No votes yet'),
          h('p.lb-total', `${a.totalVotes} vote${a.totalVotes === 1 ? '' : 's'} total`));
      })));
}

function toggleBtn(hidden, onToggle) {
  return h('button.hide-btn', { type: 'button', class: hidden ? 'is-hidden' : '', onclick: onToggle, 'aria-pressed': String(hidden) },
    hidden ? 'Hidden · unhide' : 'Hide');
}

async function act(fn) {
  try {
    await fn();
    await refresh();
  } catch (err) {
    alert(err.message);
  }
}

function renderTaglines() {
  const q = $('tl-search').value.trim().toLowerCase();
  const onlyWith = $('tl-only-with').checked;
  const people = data.people.filter((p) => {
    if (onlyWith && !p.received.length && !p.selfTagline) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.selfTagline.toLowerCase().includes(q) ||
      p.received.some((t) => t.text.toLowerCase().includes(q) || t.from.toLowerCase().includes(q));
  });
  $('tl-list').replaceChildren(
    h('p.ad-meta', `${data.counts.taglines} taglines · ${data.counts.hiddenTaglines} hidden · hidden ones are left out of the CSV`),
    ...people.map((p) =>
      h('article.tl-person',
        h('header',
          h('h3', p.name),
          h('span.ad-meta', `${p.received.filter((t) => !t.hidden).length} taglines`),
          p.submitted ? null : h('span.badge.badge-soft', 'not voted yet')),
        p.selfTagline
          ? h('div.tl-item.tl-self', { class: p.selfHidden ? 'is-hidden' : '' },
              h('span.tl-from', 'Self'),
              h('q', p.selfTagline),
              toggleBtn(p.selfHidden, () => act(() =>
                call('POST', `/api/admin/submission/${encodeURIComponent(p.name)}/hide`, { field: 'self', hidden: !p.selfHidden }))))
          : null,
        ...p.received.map((t) =>
          h('div.tl-item', { class: t.hidden ? 'is-hidden' : '' },
            h('span.tl-from', t.from),
            h('q', t.text),
            toggleBtn(t.hidden, () => act(() => call('POST', `/api/admin/tagline/${t.id}`, { hidden: !t.hidden }))))),
        !p.selfTagline && !p.received.length ? h('p.lb-empty', 'Nothing yet') : null)));
}

function renderNotes() {
  const notes = data.notes;
  $('tab-notes').replaceChildren(
    h('p.ad-meta', `${notes.length} notes. Private: only visible here.`),
    ...notes.map((n) =>
      h('article.note', { class: n.hidden ? 'is-hidden' : '' },
        h('p', n.text),
        h('footer',
          h('span', `— ${n.from}`),
          toggleBtn(n.hidden, () => act(() =>
            call('POST', `/api/admin/submission/${encodeURIComponent(n.from)}/hide`, { field: 'note', hidden: !n.hidden })))))));
}

function renderPeople() {
  const fmtTime = (t) => new Date(t).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  $('tab-people').replaceChildren(
    h('div.people-cols',
      h('div',
        h('h3', `Voted (${data.submissions.length})`),
        h('ul.people-list',
          data.submissions.map((s) =>
            h('li',
              h('span', s.voter),
              h('small', fmtTime(s.updatedAt)),
              h('button.hide-btn', {
                type: 'button',
                title: 'Delete this submission so the person can vote again from any device',
                onclick: () => {
                  if (confirm(`Delete ${s.voter}'s submission (votes, taglines they wrote, note)? They can then vote again from any phone.`)) {
                    act(() => call('DELETE', `/api/admin/submission/${encodeURIComponent(s.voter)}`));
                  }
                },
              }, 'Reset'))))),
      h('div',
        h('h3', `Not yet (${data.pending.length})`),
        h('p.ad-meta', 'Copy and paste into the group to shame (lovingly).'),
        h('textarea.pending-box', { readOnly: true, rows: 8, value: data.pending.join(', ') }))));
}

// ---- wiring -----------------------------------------------------------------
document.querySelectorAll('.ad-tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ad-tabs button').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    document.querySelectorAll('.ad-panel').forEach((p) => (p.hidden = p.id !== `tab-${btn.dataset.tab}`));
  });
});
$('tl-search').addEventListener('input', () => data && renderTaglines());
$('tl-only-with').addEventListener('change', () => data && renderTaglines());
$('refresh-btn').addEventListener('click', refresh);
$('voting-toggle').addEventListener('change', (e) => {
  const open = e.target.checked;
  if (!open && !confirm('Close voting? Nobody will be able to submit or edit until you reopen it.')) {
    e.target.checked = true;
    return;
  }
  act(() => call('POST', '/api/admin/voting', { open }));
});

refresh();
// "Live": poll every 15 s, but not while the admin is typing in the filter.
setInterval(() => {
  if (document.visibilityState === 'visible' && document.activeElement !== $('tl-search')) refresh();
}, 15000);
