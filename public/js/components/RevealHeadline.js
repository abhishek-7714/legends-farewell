import { h } from '../dom.js';

/**
 * Headline whose characters can be "filled in" by a scroll-scrubbed reveal.
 * Copy can mark highlighted words with *asterisks* (rendered yellow).
 * Words are wrapped so they never break mid-word; each char is its own span.
 */
export function RevealHeadline(text, { tag = 'h2', className = '', speed = 1 } = {}) {
  const el = h(`${tag}.display.reveal`, { class: className, dataset: { reveal: '', revealSpeed: String(speed) } });
  el.setAttribute('aria-label', text.replace(/\*/g, ''));
  const parts = String(text).split(/(\*[^*]+\*)/g).filter(Boolean);
  parts.forEach((part) => {
    const hl = part.startsWith('*') && part.endsWith('*');
    const words = (hl ? part.slice(1, -1) : part).split(/(\s+)/);
    for (const word of words) {
      if (!word) continue;
      if (/^\s+$/.test(word)) {
        el.append(document.createTextNode(' '));
        continue;
      }
      const w = h('span.w', { 'aria-hidden': 'true', class: hl ? 'hl' : '' });
      for (const ch of Array.from(word)) w.append(h('span.c', ch));
      el.append(w);
    }
  });
  return el;
}
