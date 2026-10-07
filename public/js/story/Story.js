import { h } from '../dom.js';
import { RevealHeadline } from '../components/RevealHeadline.js';
import { FloatingTile } from '../components/FloatingTile.js';
import { CloudDivider } from '../components/CloudDivider.js';
import { StatCard } from '../components/StatCard.js';
import { RoastCard } from '../components/RoastCard.js';
import { MemoryTile } from '../components/MemoryTile.js';
import { CtaCard } from '../components/CtaCard.js';
import { diverSvg, poolSvg, campusSvg } from './illustrations.js';
import { setupMotion } from './motion.js';

// Wrap "[PLACEHOLDER…]" fragments so they're easy to spot while editing.
function markPlaceholders(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) if (/\[PLACEHOLDER[^\]]*\]|\[[XY]\]/.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
  for (const node of hits) {
    if (node.parentElement.closest('.reveal, .stat-value')) continue;
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(\[PLACEHOLDER[^\]]*\]|\[[XY]\])/).forEach((part, i) => {
      frag.append(i % 2 ? h('span.placeholder-mark', part) : document.createTextNode(part));
    });
    node.replaceWith(frag);
  }
}

const html = (markup) => {
  const t = document.createElement('template');
  t.innerHTML = markup.trim(); // only used for our static illustrations
  return t.content.firstElementChild;
};

// Scene = tall wrapper + sticky stage. With motion off, wrappers collapse to
// normal height and nothing sticks (see story.css).
// `edges` (cloud dividers) sit outside the stage so overflow:hidden never clips them.
const scene = (cls, id, stageChildren, edges = []) =>
  h(`section.scene.${cls}`, { id }, h('div.scene-stage', ...stageChildren), ...edges);

function heroSection(s) {
  const tiles = h('div.tiles', s.elements.map((e) => FloatingTile(e)));
  return scene('s-hero', 'hero', [
    h('div.hero-inner',
      h('p.hero-kicker', s.kicker),
      RevealHeadline(s.headline, { tag: 'h1', className: 'hero-title' }),
      tiles,
      h('div.hero-cone', { 'aria-hidden': 'true' }),
      h('p.scroll-cue', s.scrollCue, h('span', { 'aria-hidden': 'true' }, '↓')))]);
}

function priceSection(s, elements) {
  const shapes = ['cube', 'ball', 'pill', 'tile', 'tile', 'cube', 'tile'];
  const falling = h('div.falling', { 'aria-hidden': 'true' },
    shapes.map((shape, i) => {
      const el = elements[i % elements.length];
      return h(`div.fall.fall-${shape}`, { class: shape === 'tile' ? `tile-${el.color}` : '', style: { '--i': String(i) } },
        shape === 'tile' ? el.symbol : '');
    }));
  return scene('s-price', 'price', [
    falling,
    h('div.price-copy',
      RevealHeadline(s.headline, { className: 'price-title' }),
      h('div.price-aside',
        h('div.price-badge', { 'aria-hidden': 'true' }, '₹'),
        h('p', s.body)))],
  [CloudDivider({ edge: 'top', shape: 'mound' }), CloudDivider({ edge: 'bottom', shape: 'scallop' })]);
}

function statsSection(s, elements) {
  const pattern = h('div.symbol-pattern', { 'aria-hidden': 'true' },
    Array.from({ length: 48 }, (_, i) => h('span', elements[i % elements.length].symbol)));
  return scene('s-stats', 'stats', [
    pattern,
    h('h2.visually-hidden', s.label),
    h('div.stats-grid', s.cards.map((c, i) => StatCard(c, i)))]);
}

function dykSection(s) {
  return scene('s-dyk', 'did-you-know', [
    h('div.dyk-diver', html(diverSvg())),
    h('div.dyk-copy',
      RevealHeadline(s.kicker, { className: 'dyk-kicker' }),
      RevealHeadline(s.fact, { tag: 'p', className: 'dyk-fact', speed: 2 }),
      h('p.dyk-foot', s.footnote)),
    h('div.dyk-pool', html(poolSvg()))]);
}

function roastSection(s, havoc) {
  return scene('s-roast', 'roast', [
    h('div.roast-head', RevealHeadline(s.headline, { className: 'roast-title' })),
    h('div.roast-track',
      s.cards.map((c, i) => RoastCard(c, i)),
      h('div.roast-end',
        RevealHeadline(havoc.headline, { className: 'havoc-title' })))]);
}

function havocSection(s) {
  const svg = html(campusSvg(s.hotspots));
  // Fill hotspot labels with textContent (never innerHTML) and wrap long lines.
  svg.querySelectorAll('.hotspot').forEach((g, i) => {
    const spot = s.hotspots[i];
    g.querySelector('.hs-title').textContent = spot.title;
    const text = g.querySelector('.hs-text');
    const words = spot.label.split(' ');
    const lines = [''];
    for (const w of words) {
      if ((lines[lines.length - 1] + ' ' + w).trim().length > 30) lines.push(w);
      else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim();
    }
    lines.forEach((line, j) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      t.setAttribute('x', '14');
      t.setAttribute('dy', j ? '16' : '0');
      t.textContent = line;
      text.append(t);
    });
    const rect = g.querySelector('.hotspot-label rect');
    rect.setAttribute('width', '250');
    rect.setAttribute('height', String(36 + lines.length * 16));
  });
  return scene('s-havoc', 'havoc', [
    // Shown only without motion; with motion the headline lives at the end of the roast track.
    RevealHeadline(s.headline, { className: 'havoc-static-title' }),
    h('div.campus-wrap',
      svg,
      html('<div class="campus-warning" aria-hidden="true"><svg viewBox="0 0 120 106"><path d="M60 6 L114 100 H6 Z" fill="#fff" stroke="#ee6a2c" stroke-width="10" stroke-linejoin="round"/><rect x="54" y="36" width="12" height="36" rx="5" fill="#ee6a2c"/><circle cx="60" cy="84" r="7" fill="#ee6a2c"/></svg></div>'),
      h('p.campus-center', s.center)),
    h('ol.campus-legend', s.hotspots.map((spot) => h('li', h('b', spot.title), ' ', spot.label)))],
  [CloudDivider({ edge: 'bottom', shape: 'scallop' })]);
}

function memoriesSection(s) {
  return h('section.s-memories', { id: 'memories' },
    h('section.scene.mem-head', h('div.scene-stage',
      RevealHeadline(s.headline, { className: 'mem-title', speed: 2 }),
      h('p.mem-sub', s.subhead))),
    h('div.mem-grid', s.items.map((m, i) => MemoryTile(m, i))),
    h('div.mem-passage', s.passage.map((p) => h('p', p))));
}

function legacySection(s) {
  return h('section.s-legacy', { id: 'legacy' },
    CloudDivider({ edge: 'top', shape: 'scallop' }),
    h('div.legacy-head',
      RevealHeadline(s.headline, { className: 'legacy-title' }),
      h('p', s.body)),
    h('div.cta-row', s.cards.map((c) => CtaCard(c))));
}

export function renderStory(root, config) {
  const S = config.story.sections;
  if (!S || !S.hero) return;
  const elements = S.hero.elements;
  root.replaceChildren(
    heroSection(S.hero),
    priceSection(S.price, elements),
    statsSection(S.stats, elements),
    dykSection(S.didYouKnow),
    roastSection(S.roast, S.havoc),
    havocSection(S.havoc),
    memoriesSection(S.memories),
    legacySection(S.legacy));
  markPlaceholders(root);
  setupMotion(root);
}
