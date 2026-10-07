import { h } from '../dom.js';
import { illustration } from '../story/illustrations.js';

/** Tall white card for the horizontal roast track. */
export function RoastCard({ icon, title, text }, i = 0) {
  const art = h('div.roast-art', { 'aria-hidden': 'true' });
  art.innerHTML = illustration(icon); // static, trusted SVG from illustrations.js
  return h('article.roast-card', { class: i % 2 ? 'is-low' : '' },
    art,
    h('h3.roast-title', title),
    h('p.roast-text', text));
}
