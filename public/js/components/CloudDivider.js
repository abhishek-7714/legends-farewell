// Scalloped cloud edge. `edge: 'top'` sits on top of a section (lobes point up),
// `edge: 'bottom'` hangs below it (lobes point down). `shape: 'mound'` is the
// tall central cloud the hero falls into.
const PATHS = {
  // viewBox 0 0 1440 220, filled area is below the scallops.
  scallop:
    'M0 120 C40 70 110 70 150 105 C175 45 270 40 300 100 C330 60 400 60 430 95 C470 30 580 30 610 95 C640 65 700 60 735 100 C770 40 880 40 910 100 C940 70 1000 70 1030 100 C1070 35 1180 35 1210 100 C1240 70 1300 65 1330 100 C1360 60 1420 70 1440 95 L1440 220 L0 220 Z',
  // a single big mound with smaller lobes, like the cloud in the reference
  mound:
    'M0 220 L0 190 C60 150 120 140 170 160 C190 110 260 95 300 125 C320 70 400 50 450 85 C470 30 540 5 600 25 C640 -5 720 -10 770 20 C830 0 900 15 930 60 C990 45 1050 75 1060 115 C1110 95 1170 115 1180 150 C1240 130 1320 145 1360 170 C1400 165 1430 175 1440 185 L1440 220 Z',
};

export function CloudDivider({ edge = 'top', shape = 'scallop', color = 'var(--peri)', className = '' } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 1440 220');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', `cloud cloud-${edge} cloud-${shape} ${className}`);
  const shade = document.createElementNS(ns, 'path');
  shade.setAttribute('d', PATHS[shape]);
  shade.setAttribute('fill', 'rgba(60, 80, 170, .18)');
  shade.setAttribute('transform', 'translate(0 10)');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', PATHS[shape]);
  path.setAttribute('fill', color);
  svg.append(shade, path);
  return svg;
}
