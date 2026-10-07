import { h } from '../dom.js';
import { illustration } from '../story/illustrations.js';

/** One of the three "Be part of the legacy" cards; jumps into the survey. */
export function CtaCard({ goto, icon, theme = 'white', title, text, cta }) {
  const art = h('div.cta-art', { 'aria-hidden': 'true' });
  art.innerHTML = illustration(icon);
  return h(`a.cta-card.cta-${theme}`, { href: '#survey', dataset: { surveyGoto: goto } },
    art,
    h('h3', title),
    h('p', text),
    h('span.cta-go', cta));
}
