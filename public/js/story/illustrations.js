// Hand-built SVG illustrations in the reference's style: flat shapes, soft
// pink→blue gradients, cream highlights. Static and trusted (no user text).

const P = '#ec5fae', O = '#ee6a2c', B = '#3f6cf0', Y = '#f6e65b', N = '#0b3a41', G = '#14684a', C = '#fbf1de', PE = '#c9d2f5';

const grad = (id, a, b, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const ART = {
  midterms: `<svg viewBox="0 0 200 170"><defs>${grad('mt-a', P, B)}${grad('mt-b', Y, O)}</defs>
    <path d="M100 10 L185 160 H15 Z" fill="url(#mt-b)" opacity=".9"/>
    <g transform="rotate(-10 100 95)">
      <rect x="52" y="34" width="96" height="120" rx="6" fill="#fff" stroke="${N}" stroke-width="3"/>
      <g stroke="${PE}" stroke-width="5" stroke-linecap="round"><path d="M66 60h60M66 76h68M66 92h50M66 108h62M66 124h40"/></g>
      <circle cx="120" cy="120" r="22" fill="none" stroke="#e0254f" stroke-width="5"/>
      <text x="120" y="129" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="24" fill="#e0254f">C-</text>
    </g>
    <g transform="rotate(35 150 50)"><rect x="140" y="10" width="16" height="90" rx="3" fill="url(#mt-a)"/><path d="M140 100 L148 118 L156 100Z" fill="${C}"/><path d="M146 112 L148 118 L150 112Z" fill="${N}"/></g>
    <rect x="22" y="24" width="26" height="26" rx="4" fill="${B}" transform="rotate(-14 35 37)"/><text x="35" y="43" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="13" fill="${C}" transform="rotate(-14 35 37)">Zz</text>
  </svg>`,

  coldcall: `<svg viewBox="0 0 200 170"><defs>${grad('cc-a', Y, 'rgba(246,230,91,0)')}${grad('cc-b', P, B)}</defs>
    <path d="M86 0 H114 L170 160 H30 Z" fill="url(#cc-a)" opacity=".85"/>
    <ellipse cx="100" cy="150" rx="70" ry="12" fill="${PE}"/>
    <rect x="76" y="78" width="48" height="70" rx="20" fill="url(#cc-b)"/>
    <circle cx="100" cy="62" r="22" fill="${C}"/>
    <path d="M86 58 q4 -6 8 0 M106 58 q4 -6 8 0" stroke="${N}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="100" cy="72" rx="5" ry="6" fill="${N}"/>
    <g fill="${O}"><path d="M150 40 h34 a6 6 0 0 1 6 6 v24 a6 6 0 0 1 -6 6 h-20 l-10 10 v-10 h-4 a6 6 0 0 1 -6 -6 v-24 a6 6 0 0 1 6 -6z"/></g>
    <text x="167" y="68" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="26" fill="#fff">?</text>
    <path d="M18 40 l8 8 M30 30 l2 12 M14 58 l12 -2" stroke="${N}" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  placement: `<svg viewBox="0 0 200 170"><defs>${grad('pl-a', O, P)}${grad('pl-b', B, N)}</defs>
    <circle cx="100" cy="88" r="70" fill="${PE}"/>
    <rect x="40" y="70" width="120" height="80" rx="10" fill="url(#pl-a)"/>
    <path d="M78 70 v-14 a8 8 0 0 1 8 -8 h28 a8 8 0 0 1 8 8 v14" fill="none" stroke="${N}" stroke-width="7"/>
    <rect x="40" y="96" width="120" height="8" fill="${N}" opacity=".25"/>
    <rect x="90" y="92" width="20" height="16" rx="3" fill="${Y}"/>
    <g transform="translate(132 18) rotate(18)"><path d="M10 0 h16 l-4 10 l10 52 l-14 14 l-14 -14 l10 -52z" fill="url(#pl-b)"/><path d="M8 0 h20 l-4 10 h-12z" fill="${N}"/></g>
    <g fill="${Y}"><path d="M28 30 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z"/><path d="M170 140 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/></g>
  </svg>`,

  mess: `<svg viewBox="0 0 200 170"><defs>${grad('ms-a', P, B)}${grad('ms-b', Y, O)}</defs>
    <ellipse cx="100" cy="128" rx="84" ry="28" fill="${N}" opacity=".15"/>
    <path d="M24 92 h152 a76 52 0 0 1 -152 0z" fill="url(#ms-a)"/>
    <ellipse cx="100" cy="92" rx="76" ry="16" fill="url(#ms-b)"/>
    <circle cx="74" cy="90" r="9" fill="${C}"/><circle cx="118" cy="88" r="7" fill="${G}"/><rect x="92" y="84" width="12" height="12" rx="2" fill="${C}" transform="rotate(20 98 90)"/>
    <g stroke="${PE}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M76 66 q-10 -14 0 -26 q10 -12 0 -26"/><path d="M104 62 q-10 -14 0 -26 q10 -12 0 -26"/></g>
    <circle cx="156" cy="40" r="20" fill="${Y}"/><text x="156" y="49" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="26" fill="${N}">?</text>
  </svg>`,

  group: `<svg viewBox="0 0 200 170"><defs>${grad('gp-a', B, P)}</defs>
    <rect x="34" y="40" width="132" height="88" rx="8" fill="${N}"/>
    <rect x="42" y="48" width="116" height="72" rx="4" fill="${PE}"/>
    <path d="M20 128 h160 l-12 16 h-136z" fill="url(#gp-a)"/>
    <rect x="54" y="60" width="46" height="56" rx="3" fill="#fff"/><path d="M88 60 v12 h12" fill="${PE}"/>
    <text x="77" y="100" text-anchor="middle" font-family="Inter, Arial" font-weight="800" font-size="11" fill="${O}">v7</text>
    <g><path d="M112 66 l0 18 l5 -4 l4 8 l4 -2 l-4 -8 l6 0z" fill="${P}"/><path d="M130 86 l0 18 l5 -4 l4 8 l4 -2 l-4 -8 l6 0z" fill="${O}"/><path d="M110 96 l0 18 l5 -4 l4 8 l4 -2 l-4 -8 l6 0z" fill="${G}"/></g>
    <g fill="${Y}"><rect x="128" y="18" width="52" height="26" rx="13"/></g><text x="154" y="36" text-anchor="middle" font-family="Inter, Arial" font-weight="800" font-size="12" fill="${N}">final??</text>
  </svg>`,

  morning: `<svg viewBox="0 0 200 170"><defs>${grad('mo-a', P, B)}${grad('mo-b', Y, O)}</defs>
    <circle cx="150" cy="44" r="26" fill="url(#mo-b)"/>
    <g transform="rotate(-8 88 92)">
      <circle cx="60" cy="40" r="14" fill="${O}"/><circle cx="116" cy="40" r="14" fill="${O}"/>
      <circle cx="88" cy="92" r="52" fill="url(#mo-a)"/><circle cx="88" cy="92" r="40" fill="${C}"/>
      <path d="M88 92 V64 M88 92 l18 10" stroke="${N}" stroke-width="5" stroke-linecap="round"/>
      <text x="88" y="132" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="11" fill="${N}">8:30</text>
      <path d="M58 140 l-8 14 M118 140 l8 14" stroke="${N}" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g><path d="M140 108 h34 v34 a12 12 0 0 1 -12 12 h-10 a12 12 0 0 1 -12 -12z" fill="#fff" stroke="${N}" stroke-width="3"/><path d="M174 118 a9 9 0 0 1 0 18" stroke="${N}" stroke-width="3" fill="none"/><path d="M150 100 q-5 -8 0 -14 M162 100 q-5 -8 0 -14" stroke="${N}" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>
  </svg>`,

  trophy: `<svg viewBox="0 0 200 170"><defs>${grad('tr-a', Y, O)}${grad('tr-b', P, B)}</defs>
    <path d="M60 30 h80 v30 a40 40 0 0 1 -80 0z" fill="url(#tr-a)"/>
    <path d="M60 40 h-20 a18 18 0 0 0 22 30 M140 40 h20 a18 18 0 0 1 -22 30" fill="none" stroke="${O}" stroke-width="8"/>
    <rect x="92" y="98" width="16" height="22" fill="${O}"/><rect x="66" y="120" width="68" height="22" rx="4" fill="url(#tr-b)"/>
    <text x="100" y="70" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="28" fill="${N}">Lg</text>
    <g fill="${P}"><path d="M30 24 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z"/></g><g fill="${B}"><path d="M170 110 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z"/></g>
  </svg>`,

  tag: `<svg viewBox="0 0 200 170"><defs>${grad('tg-a', P, O, 1, 1)}</defs>
    <path d="M40 40 L118 30 L172 92 L104 150 L46 100 Z" fill="url(#tg-a)"/>
    <circle cx="70" cy="58" r="10" fill="${G}"/><circle cx="70" cy="58" r="5" fill="${C}"/>
    <path d="M70 58 C40 20 20 40 14 18" stroke="${Y}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <text x="114" y="104" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="22" fill="#fff" transform="rotate(-20 114 100)">Man of Steal</text>
  </svg>`,

  note: `<svg viewBox="0 0 200 170"><defs>${grad('nt-a', B, P)}</defs>
    <rect x="34" y="48" width="132" height="92" rx="8" fill="url(#nt-a)"/>
    <path d="M34 56 L100 104 L166 56" fill="none" stroke="${C}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="58" y="20" width="84" height="60" rx="4" fill="#fff" transform="rotate(-6 100 50)"/>
    <path d="M100 66 c-10 -8 -18 -14 -18 -22 a9 9 0 0 1 18 -3 a9 9 0 0 1 18 3 c0 8 -8 14 -18 22z" fill="${P}" transform="rotate(-6 100 50)"/>
  </svg>`,
};

export function illustration(name) {
  return ART[name] || ART.trophy;
}

/** Student standing on a podium of case readings (the reference's swimmer). */
export function diverSvg() {
  return `<svg viewBox="0 0 200 260" class="diver" aria-hidden="true"><defs>${grad('dv-a', P, B)}${grad('dv-b', PE, '#fff', 1, 0)}</defs>
    <g class="diver-body">
      <circle cx="100" cy="30" r="16" fill="#f2c9a8"/><path d="M84 26 a16 16 0 0 1 32 0 q-16 -8 -32 0z" fill="${N}"/>
      <path d="M80 54 q20 -10 40 0 l6 70 h-52z" fill="${O}"/>
      <path d="M80 58 l-14 50 M120 58 l14 50" stroke="#f2c9a8" stroke-width="10" stroke-linecap="round"/>
      <path d="M88 124 l-2 56 M112 124 l2 56" stroke="#f2c9a8" stroke-width="11" stroke-linecap="round"/>
      <rect x="92" y="70" width="16" height="10" rx="2" fill="${Y}"/>
    </g>
    <ellipse cx="100" cy="196" rx="58" ry="14" fill="url(#dv-b)"/>
    <rect x="42" y="196" width="116" height="16" fill="${PE}"/>
    <ellipse cx="100" cy="212" rx="58" ry="14" fill="url(#dv-a)"/>
    <text x="100" y="217" text-anchor="middle" font-family="Inter, Arial" font-weight="800" font-size="11" fill="#fff">CASE PACK</text>
  </svg>`;
}

/** Perspective pool full of "building on…" speech bubbles. */
export function poolSvg() {
  const lanes = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const xTop = 260 + t * 480;
    const xBot = 20 + t * 960;
    const col = i % 2 ? Y : O;
    return `<path d="M${xTop} 40 L${xBot} 300" stroke="${N}" stroke-width="3" opacity=".55"/><path d="M${xTop} 40 L${xBot} 300" stroke="${col}" stroke-width="2" stroke-dasharray="10 14"/>`;
  }).join('');
  const bubble = (x, y, s, text) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-46 -16 h92 a10 10 0 0 1 10 10 v14 a10 10 0 0 1 -10 10 h-70 l-12 10 v-10 h-10 a10 10 0 0 1 -10 -10 v-14 a10 10 0 0 1 10 -10z" fill="${C}" stroke="${B}" stroke-width="3"/><text x="0" y="5" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="13" fill="${N}">${text}</text></g>`;
  return `<svg viewBox="0 0 1000 300" class="pool" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs>${grad('pool-w', '#5b86ff', B)}${grad('pool-e', '#fff', PE)}</defs>
    <path d="M230 20 H770 L1000 300 H0 Z" fill="url(#pool-e)"/>
    <path d="M260 40 H740 L980 300 H20 Z" fill="url(#pool-w)"/>
    ${lanes}
    ${bubble(330, 120, 0.9, 'building on…')}${bubble(560, 90, 0.75, '+1 to that')}${bubble(780, 190, 1.1, 'building on…')}${bubble(200, 240, 1.2, 'as X said…')}${bubble(500, 230, 1.05, 'adding to…')}
  </svg>`;
}

/** Campus "planet" with four hotspot vignettes; the ID card is layered on top in HTML. */
export function campusSvg(hotspots) {
  // Hotspot anchor points (illustration centre) and label boxes, in viewBox units.
  const spots = [
    { art: 'library', cx: 190, cy: 210, lx: 300, ly: 150 },
    { art: 'mess', cx: 820, cy: 200, lx: 560, ly: 120 },
    { art: 'canteen', cx: 170, cy: 600, lx: 120, ly: 700 },
    { art: 'backrow', cx: 830, cy: 610, lx: 620, ly: 700 },
  ];
  const vignette = {
    library: `<circle r="80" fill="${Y}"/><g transform="translate(-50 -48)"><rect width="100" height="96" rx="4" fill="${O}"/><g fill="${C}"><rect x="8" y="8" width="12" height="36"/><rect x="24" y="12" width="10" height="32" fill="${B}"/><rect x="38" y="6" width="14" height="38" fill="${P}"/><rect x="56" y="10" width="10" height="34"/><rect x="70" y="8" width="16" height="36" fill="${G}"/><rect x="8" y="54" width="18" height="34" fill="${P}"/><rect x="30" y="58" width="12" height="30"/><rect x="46" y="52" width="14" height="36" fill="${B}"/><rect x="64" y="56" width="26" height="32" fill="${C}"/></g></g><text x="44" y="-50" font-family="Oswald, Arial Narrow" font-weight="700" font-size="26" fill="${N}">Zz</text>`,
    mess: `<circle r="80" fill="${P}"/><ellipse cy="10" rx="60" ry="22" fill="${C}"/><circle cx="-26" cy="6" r="12" fill="${Y}"/><circle cx="4" cy="16" r="12" fill="${O}"/><circle cx="30" cy="4" r="11" fill="${G}"/><path d="M-20 -24 q-8 -12 0 -24 M10 -24 q-8 -12 0 -24" stroke="${C}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    canteen: `<circle r="80" fill="${B}"/><circle cx="40" cy="-40" r="16" fill="${Y}"/><circle cx="48" cy="-46" r="14" fill="${B}"/><path d="M-50 0 h100 a50 40 0 0 1 -100 0z" fill="${O}"/><path d="M-40 -2 q10 -14 20 0 q10 -14 20 0 q10 -14 20 0 q10 -14 20 0" stroke="${Y}" stroke-width="5" fill="none"/><path d="M30 -10 L60 -50" stroke="${C}" stroke-width="5" stroke-linecap="round"/>`,
    backrow: `<circle r="80" fill="${O}"/><g fill="${N}"><rect x="-56" y="-6" width="30" height="8" rx="2"/><rect x="-14" y="-6" width="30" height="8" rx="2"/><rect x="28" y="-6" width="30" height="8" rx="2"/><rect x="-56" y="-34" width="6" height="56"/><rect x="-14" y="-34" width="6" height="56"/><rect x="28" y="-34" width="6" height="56"/></g><g fill="${C}"><circle cx="-36" cy="-24" r="9"/><circle cx="6" cy="-26" r="9"/><circle cx="48" cy="-22" r="9"/></g><text x="0" y="56" text-anchor="middle" font-family="Inter, Arial" font-weight="800" font-size="14" fill="${C}">Wi-Fi ▮▮▮▮</text>`,
  };
  const items = spots.slice(0, hotspots.length).map((s, i) => `
    <g class="hotspot" data-i="${i}">
      <path class="hotspot-line" d="M${s.cx} ${s.cy} L${s.lx + 110} ${s.ly + 30} L500 400" fill="none" stroke="${C}" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>
      <g class="hotspot-art" transform="translate(${s.cx} ${s.cy})">${vignette[s.art]}<circle r="16" cx="62" cy="-62" fill="${N}"/><text x="62" y="-55" text-anchor="middle" font-family="Inter, Arial" font-weight="800" font-size="20" fill="${C}">${i + 1}</text></g>
      <g class="hotspot-label" transform="translate(${s.lx} ${s.ly})"><g class="hs-inner"><rect width="220" height="60" rx="12" fill="#fff"/><text class="hs-title" x="14" y="24" font-family="Inter, Arial" font-weight="800" font-size="16" fill="${N}"></text><text class="hs-text" x="14" y="44" font-family="Inter, Arial" font-size="12" fill="${N}"></text></g></g>
    </g>`).join('');
  return `<svg viewBox="0 0 1000 800" class="campus" aria-hidden="true"><defs>${grad('cp-sea', '#5b86ff', B)}</defs>
    <g class="campus-planet">
      <circle cx="500" cy="900" r="760" fill="${C}"/>
      <circle cx="500" cy="910" r="740" fill="url(#cp-sea)"/>
      <path d="M-40 330 C60 250 180 280 230 330 C280 380 250 450 160 470 C80 490 0 460 -40 430Z M760 260 C840 220 980 240 1040 300 L1040 470 C960 480 860 430 820 380 C790 340 730 300 760 260Z M300 760 C380 700 520 700 600 760 C640 790 640 820 600 840 L300 840Z M-40 680 C40 640 120 660 140 720 L140 840 L-40 840Z" fill="${G}"/>
      <g stroke="${G}" stroke-width="6" stroke-linecap="round" opacity=".8"><path d="M880 760 v-60 M900 760 v-80 M920 760 v-50"/><path d="M80 600 v-40 M96 600 v-56"/></g>
    </g>
    ${items}
  </svg>`;
}
