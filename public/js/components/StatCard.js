import { h } from '../dom.js';

/** Big coloured stat: huge number, small unit, tiny caption. */
export function StatCard({ value, unit, caption, color = 'pink' }, i = 0) {
  return h(`article.stat-card.stat-${color}`, { dataset: { i: String(i) } },
    h('span.stat-value', value),
    h('span.stat-side',
      h('span.stat-unit', unit),
      h('span.stat-caption', caption)));
}
