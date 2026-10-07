import { h, fmt, storage, prefersReducedMotion } from '../dom.js';
import { api } from '../api.js';
import { Combobox } from '../components/Combobox.js';
import { confettiBurst } from '../confetti.js';

const TOKENS_KEY = 'legends.tokens'; // { [voter]: editToken }
const LAST_KEY = 'legends.lastVoter';
const draftKey = (voter) => `legends.draft.${voter}`;

/**
 * Multi-step survey: who → one card per award → taglines → note → review.
 * Mounts into `root`. Listens for `survey:goto` events from the story CTAs.
 */
export function mountSurvey(root, config) {
  const copy = config.story.survey;
  const S = copy.steps;
  const { members, awards, limits } = config;

  const state = {
    voter: null,
    token: null,
    returning: false,
    awards: {},
    taglines: [{ target: null, text: '' }],
    selfTagline: '',
    note: '',
  };
  let stepIndex = 0;
  let pendingJump = null;
  let busy = false;

  const steps = [
    { kind: 'who', group: 'who' },
    ...awards.map((award, i) => ({ kind: 'award', group: 'awards', award, i })),
    { kind: 'taglines', group: 'taglines' },
    { kind: 'note', group: 'note' },
    { kind: 'review', group: 'review' },
  ];
  const groups = ['who', 'awards', 'taglines', 'note', 'review'];
  const firstOf = (group) => steps.findIndex((s) => s.group === group);

  // ---- shell -----------------------------------------------------------------
  const progressFill = h('div.sv-progress-fill');
  const progressLabels = h(
    'ol.sv-progress-labels',
    groups.map((g) =>
      h('li', { dataset: { group: g } },
        h('button', { type: 'button', onclick: () => jumpTo(g) }, S[g].label))
    )
  );
  const stage = h('div.sv-stage', { 'aria-live': 'polite' });
  const errorBox = h('p.sv-error', { role: 'alert', hidden: true });
  const shell = h(
    'div.sv-shell',
    h('div.sv-progress', { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100' }, progressFill),
    progressLabels,
    stage,
    errorBox
  );

  root.replaceChildren(
    h('header.sv-head',
      h('p.eyebrow', copy.eyebrow),
      h('h2.sv-title', copy.title),
      h('p.sv-intro', copy.intro)),
    shell
  );

  if (!config.dbReady) return showBlocked(copy.dbMissing);
  if (!config.votingOpen) return showBlocked(copy.closed);

  // ---- persistence -----------------------------------------------------------
  const tokens = () => storage.get(TOKENS_KEY, {}) || {};
  function saveDraft() {
    if (!state.voter) return;
    storage.set(draftKey(state.voter), {
      awards: state.awards,
      taglines: state.taglines,
      selfTagline: state.selfTagline,
      note: state.note,
    });
  }
  function applyData(d) {
    state.awards = { ...(d.awards || {}) };
    // Drop anything that no longer matches the config (awards or names edited later).
    for (const [id, name] of Object.entries(state.awards)) {
      if (!awards.some((a) => a.id === id) || !members.includes(name) || name === state.voter) delete state.awards[id];
    }
    state.taglines = (d.taglines || []).filter((t) => t && (t.target || t.text)).map((t) => ({
      target: members.includes(t.target) && t.target !== state.voter ? t.target : null,
      text: t.text || '',
    }));
    if (!state.taglines.length) state.taglines.push({ target: null, text: '' });
    state.selfTagline = d.selfTagline || '';
    state.note = d.note || '';
  }

  async function chooseVoter(name) {
    clearError();
    if (!name) {
      state.voter = null;
      return render();
    }
    state.voter = name;
    state.token = tokens()[name] || null;
    state.returning = false;
    state.locked = false;
    applyData({});
    busy = true;
    render();
    try {
      if (state.token) {
        try {
          const saved = await api.load(name, state.token);
          applyData(saved);
          state.returning = true;
        } catch (err) {
          if (err.status === 404) state.token = null; // stale token (admin reset it)
          else throw err;
        }
      }
      if (!state.returning) {
        const { submitted } = await api.status(name);
        state.locked = submitted;
      }
      const draft = storage.get(draftKey(name));
      if (draft && !state.locked) applyData(draft);
      storage.set(LAST_KEY, name);
    } catch (err) {
      showError(err.message);
    } finally {
      busy = false;
      render();
    }
  }

  // ---- navigation -----------------------------------------------------------
  function go(delta) {
    const next = Math.min(steps.length - 1, Math.max(0, stepIndex + delta));
    if (next === stepIndex) return;
    if (stepIndex === 0 && (!state.voter || state.locked || busy)) return;
    setStep(next, delta > 0 ? 'fwd' : 'back');
  }
  function setStep(i, dir = 'fwd') {
    clearError();
    stepIndex = i;
    render(dir);
    // Keep the card in view on phones, but don't yank the page if it already is.
    const top = shell.getBoundingClientRect().top;
    if (dir === 'jump' || top < 0 || top > window.innerHeight * 0.4) {
      shell.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function jumpTo(group) {
    if (!state.voter || state.locked) {
      pendingJump = group === 'who' ? null : group;
      return setStep(0, 'jump');
    }
    setStep(firstOf(group), 'jump');
  }
  window.addEventListener('survey:goto', (e) => {
    root.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    jumpTo(e.detail || 'awards');
  });

  // ---- rendering ------------------------------------------------------------
  function render(dir) {
    const step = steps[stepIndex];
    const pct = Math.round((stepIndex / (steps.length - 1)) * 100);
    progressFill.style.width = `${Math.max(4, pct)}%`;
    shell.querySelector('.sv-progress').setAttribute('aria-valuenow', String(pct));
    for (const li of progressLabels.children) {
      const gi = groups.indexOf(li.dataset.group);
      li.classList.toggle('is-current', li.dataset.group === step.group);
      li.classList.toggle('is-done', gi < groups.indexOf(step.group));
      li.querySelector('button').disabled = !state.voter || state.locked;
    }
    const view =
      step.kind === 'who' ? whoView()
      : step.kind === 'award' ? awardView(step)
      : step.kind === 'taglines' ? taglinesView()
      : step.kind === 'note' ? noteView()
      : reviewView();
    view.classList.add('sv-card');
    if (dir && !prefersReducedMotion()) view.classList.add(`enter-${dir}`);
    stage.replaceChildren(view);
  }

  function navRow({ back = true, nextLabel = copy.nav.next, onNext = () => go(1), nextDisabled = false, extra = null }) {
    return h('div.sv-nav',
      back ? h('button.btn.btn-ghost', { type: 'button', onclick: () => go(-1) }, copy.nav.back) : h('span'),
      extra,
      h('button.btn.btn-primary', { type: 'button', onclick: onNext, disabled: nextDisabled }, nextLabel));
  }

  function whoView() {
    const cb = Combobox({
      options: members,
      value: state.voter,
      placeholder: S.who.placeholder,
      label: S.who.title,
      onChange: (v) => chooseVoter(v),
    });
    let status = null;
    if (busy) status = h('p.sv-status', '…');
    else if (state.voter && state.locked) status = h('p.sv-status.is-warn', fmt(S.who.locked, { name: state.voter }));
    else if (state.voter && state.returning) status = h('p.sv-status.is-ok', fmt(S.who.returning, { name: state.voter }));
    const proceed = () => {
      if (pendingJump) {
        const g = pendingJump;
        pendingJump = null;
        return setStep(firstOf(g), 'fwd');
      }
      go(1);
    };
    return h('section.sv-who',
      h('h3', S.who.title),
      h('p.sv-help', S.who.help),
      cb,
      status,
      navRow({ back: false, onNext: proceed, nextDisabled: !state.voter || state.locked || busy }));
  }

  function awardView(step) {
    const { award, i } = step;
    const choice = state.awards[award.id] || null;
    const picked = h('p.sv-picked', { hidden: !choice }, choice ? fmt(S.awards.picked, { name: choice }) : '');
    const cb = Combobox({
      options: members,
      value: choice,
      placeholder: S.awards.placeholder,
      label: award.title,
      disabledReason: (n) => (n === state.voter ? S.awards.selfBlocked : null),
      onChange: (v) => {
        if (v) state.awards[award.id] = v;
        else delete state.awards[award.id];
        picked.hidden = !v;
        picked.textContent = v ? fmt(S.awards.picked, { name: v }) : '';
        dots.querySelectorAll('button')[i].classList.toggle('is-voted', Boolean(v));
        saveDraft();
      },
    });
    const dots = h('div.sv-dots',
      awards.map((a, j) =>
        h('button', {
          type: 'button',
          'aria-label': a.title,
          title: a.title,
          class: [j === i ? 'is-current' : '', state.awards[a.id] ? 'is-voted' : ''].join(' '),
          onclick: () => setStep(firstOf('awards') + j, j > i ? 'fwd' : 'back'),
        })));
    const card = h('article.award-card', { style: { '--tilt': `${i % 2 ? 1.2 : -1.2}deg` } },
      h('p.award-count', fmt(S.awards.counter, { n: i + 1, total: awards.length })),
      award.emoji ? h('div.award-emoji', { 'aria-hidden': 'true' }, award.emoji) : null,
      h('h3.award-title', award.title),
      h('p.award-desc', award.description),
      cb,
      picked);
    enableSwipe(card);
    return h('section.sv-award',
      i === 0 ? h('p.sv-help', S.awards.help) : null,
      card,
      dots,
      navRow({
        extra: !choice ? h('button.btn.btn-link', { type: 'button', onclick: () => go(1) }, S.awards.skip) : null,
        nextLabel: i === awards.length - 1 ? copy.nav.next : S.awards.next,
      }));
  }

  function enableSwipe(card) {
    let x0 = null;
    let y0 = null;
    card.addEventListener('touchstart', (e) => {
      if (e.target.closest('.cb')) return; // don't hijack the dropdown
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    card.addEventListener('touchmove', (e) => {
      if (x0 == null) return;
      const dx = e.touches[0].clientX - x0;
      const dy = e.touches[0].clientY - y0;
      if (Math.abs(dx) > Math.abs(dy)) card.style.transform = `translateX(${dx * 0.6}px) rotate(${dx / 40}deg)`;
    }, { passive: true });
    card.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      card.style.transform = '';
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    });
  }

  function counter(input, max) {
    const el = h('span.sv-count');
    const update = () => {
      const n = Array.from(input.value).length;
      el.textContent = `${n}/${max}`;
      el.classList.toggle('is-over', n > max);
    };
    input.addEventListener('input', update);
    update();
    return el;
  }

  function taglinesView() {
    const T = S.taglines;
    const list = h('div.tl-list');
    const examples = h('div.tl-examples', T.examples.map((ex) => h('span.chip', ex)));

    function row(t, idx) {
      const input = h('input.tl-text', {
        type: 'text',
        value: t.text,
        maxLength: limits.tagline,
        placeholder: T.taglinePlaceholder,
        'aria-label': 'Tagline',
        oninput: (e) => {
          t.text = e.target.value;
          saveDraft();
        },
      });
      return h('div.tl-row',
        Combobox({
          options: members,
          value: t.target,
          placeholder: T.friendPlaceholder,
          label: 'Friend',
          disabledReason: (n) => (n === state.voter ? 'Use the box below for yours' : null),
          onChange: (v) => {
            t.target = v;
            saveDraft();
          },
        }),
        h('div.tl-input-wrap', input, counter(input, limits.tagline)),
        state.taglines.length > 1 || t.target || t.text
          ? h('button.tl-remove', {
              type: 'button',
              'aria-label': T.remove,
              onclick: () => {
                state.taglines.splice(idx, 1);
                if (!state.taglines.length) state.taglines.push({ target: null, text: '' });
                saveDraft();
                draw();
              },
            }, '×')
          : null);
    }
    function draw() {
      list.replaceChildren(...state.taglines.map(row));
    }
    draw();

    const self = h('input.tl-text', {
      type: 'text',
      value: state.selfTagline,
      maxLength: limits.tagline,
      placeholder: T.selfPlaceholder,
      'aria-label': T.selfTitle,
      oninput: (e) => {
        state.selfTagline = e.target.value;
        saveDraft();
      },
    });

    return h('section.sv-taglines',
      h('h3', T.title),
      h('p.sv-help', fmt(T.help, { max: limits.tagline })),
      examples,
      list,
      h('button.btn.btn-ghost.tl-add', {
        type: 'button',
        onclick: () => {
          state.taglines.push({ target: null, text: '' });
          draw();
          list.lastElementChild?.querySelector('.cb-input')?.focus();
        },
      }, T.add),
      h('div.tl-self',
        h('h4', T.selfTitle),
        h('div.tl-input-wrap', self, counter(self, limits.tagline))),
      navRow({ onNext: () => checkTaglines() && go(1) }));
  }

  function checkTaglines() {
    for (const t of state.taglines) {
      const text = t.text.trim();
      if (!t.target && !text) continue;
      if (!t.target) return showError('One of your taglines has no friend picked. Who is it for?');
      if (!text) return showError(`The tagline for ${t.target} is empty.`);
      if (Array.from(text).length > limits.tagline) return showError(`Tagline for ${t.target} is too long.`);
    }
    return true;
  }

  function noteView() {
    const ta = h('textarea.sv-note', {
      rows: 6,
      maxLength: limits.note,
      placeholder: S.note.placeholder,
      'aria-label': S.note.title,
      value: state.note,
      oninput: (e) => {
        state.note = e.target.value;
        saveDraft();
      },
    });
    ta.value = state.note;
    return h('section.sv-notebox',
      h('h3', S.note.title),
      h('p.sv-help', S.note.help),
      h('div.tl-input-wrap', ta, counter(ta, limits.note)),
      navRow({}));
  }

  function reviewView() {
    const R = S.review;
    const voted = awards.filter((a) => state.awards[a.id]);
    const tls = state.taglines.filter((t) => t.target && t.text.trim());
    const submitBtn = h('button.btn.btn-primary.btn-big', { type: 'button', onclick: submit },
      state.returning ? R.update : R.submit);
    return h('section.sv-review',
      h('h3', R.title),
      h('ul.review-stats',
        h('li', h('strong', String(voted.length)), fmt(R.awardsCount, { n: '', total: awards.length }).trim()),
        h('li', h('strong', String(tls.length)), fmt(R.taglinesCount, { n: '' }).trim()),
        h('li', state.note.trim() ? R.noteYes : R.noteNo)),
      voted.length
        ? h('ul.review-awards', voted.map((a) => h('li', h('span', `${a.emoji || ''} ${a.title}`), h('b', state.awards[a.id]))))
        : null,
      h('p.sv-help', R.help),
      h('div.sv-nav',
        h('button.btn.btn-ghost', { type: 'button', onclick: () => go(-1) }, copy.nav.back),
        submitBtn));

    async function submit() {
      if (busy) return;
      if (!checkTaglines()) return;
      busy = true;
      submitBtn.disabled = true;
      submitBtn.textContent = R.submitting;
      try {
        const res = await api.submit({
          voter: state.voter,
          token: state.token,
          awards: state.awards,
          taglines: state.taglines.filter((t) => t.target || t.text.trim()),
          selfTagline: state.selfTagline,
          note: state.note,
        });
        state.token = res.token;
        storage.set(TOKENS_KEY, { ...tokens(), [state.voter]: res.token });
        storage.remove(draftKey(state.voter));
        state.returning = true;
        showDone();
      } catch (err) {
        showError(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = state.returning ? R.update : R.submit;
      } finally {
        busy = false;
      }
    }
  }

  function showDone() {
    const D = copy.done;
    progressFill.style.width = '100%';
    const view = h('section.sv-card.sv-done',
      h('div.done-badge', { 'aria-hidden': 'true' }, h('span', 'Lg'), h('small', '∞')),
      h('h3', D.title),
      h('p', D.body),
      h('p.sv-help', D.share),
      h('button.btn.btn-ghost', { type: 'button', onclick: () => setStep(firstOf('awards'), 'back') }, D.edit));
    stage.replaceChildren(view);
    view.scrollIntoView({ behavior: 'smooth', block: 'center' });
    confettiBurst();
  }

  function showBlocked(msg) {
    shell.replaceChildren(h('div.sv-card.sv-blocked', h('p', msg)));
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    return false;
  }
  function clearError() {
    errorBox.hidden = true;
  }

  // ---- boot -----------------------------------------------------------------
  render();
  const last = storage.get(LAST_KEY);
  if (last && members.includes(last) && tokens()[last]) chooseVoter(last);
}
