import { h } from '../dom.js';

/** Tilted "periodic table" tile: atomic number, symbol, element name. */
export function FloatingTile({ symbol, name, number, color = 'yellow', x = 0, y = 0, tilt = 0, depth = 1, desktopOnly = false, size = '' }) {
  return h(`div.tile.tile-${color}`,
    {
      class: [desktopOnly ? 'desktop-only' : '', size ? `tile-${size}` : ''].join(' '),
      style: { left: `${x}%`, top: `${y}%`, '--tilt': `${tilt}deg` },
      dataset: { depth: String(depth) },
      title: name,
    },
    h('span.tile-num', String(number)),
    h('span.tile-sym', symbol),
    h('span.tile-name', name));
}
