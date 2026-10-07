import { h } from '../dom.js';

// Lazy photos change the page height after scroll triggers were measured;
// re-measure once per frame when any of them finishes loading.
let queued = false;
function remeasure() {
  if (queued || !window.ScrollTrigger) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    window.ScrollTrigger.refresh();
  });
}

/** Polaroid-style memory. Empty `image` renders a visible "add a photo" slot. */
export function MemoryTile({ image, caption }, i = 0) {
  const tilt = [-3, 2, -1.5, 3, -2.5, 1.5, -1, 2.5][i % 8];
  const media = image
    ? h('img', { src: image, alt: caption.replace(/\[PLACEHOLDER:?\s*|\]/g, ''), loading: 'lazy', decoding: 'async', onload: remeasure })
    : h('div.memory-empty', h('span', '📷'), h('small', 'Add photo in story.json'));
  return h('figure.memory', { style: { '--tilt': `${tilt}deg` }, dataset: { i: String(i) } },
    media,
    h('figcaption', caption));
}
