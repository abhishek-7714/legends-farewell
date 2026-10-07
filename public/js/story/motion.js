// Scroll-driven motion, implemented from MOTION.md.
// Every pinned scene is a tall <section.scene> whose .scene-stage is
// position: sticky. A GSAP timeline per scene is scrubbed across the scene's
// "animation" distance. Timeline durations are written in vh, so the numbers
// below read like the spec ("reveal over 80vh, then hold").
// If GSAP is missing or the user prefers reduced motion, nothing here runs and
// the page keeps its static layout.
import { prefersReducedMotion } from '../dom.js';

const DIM = 0.28; // un-revealed characters: same colour at ~30% opacity

export function setupMotion(root) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || prefersReducedMotion()) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.documentElement.classList.add('motion');

  const mobile = () => window.innerWidth < 768;
  const k = mobile() ? 0.65 : 1; // shorter pins on phones (MOTION.md: ~60%)
  const vh = () => window.innerHeight / 100;
  const $ = (sel, el = root) => el.querySelector(sel);
  const $$ = (sel, el = root) => Array.from(el.querySelectorAll(sel));

  // ---- helpers ---------------------------------------------------------------

  /** Char-by-char reveal: a ~8-character soft edge sweeping left→right. */
  function reveal(tl, el, at, dur) {
    const chars = $$('.c', el);
    const n = chars.length;
    const each = dur / (n + 8);
    tl.fromTo(chars, { opacity: DIM }, { opacity: 1, ease: 'none', duration: each * 8, stagger: { each } }, at);
  }
  function dimChars(el) {
    gsap.set($$('.c', el), { opacity: DIM });
  }

  /**
   * A pinned scene: section height = anim + 100vh (stage) + cover, where
   * `cover` is how far the *next* section slides over this stuck stage.
   */
  const scenes = [];
  function pinScene(section, { anim, cover = 0, overlapPrev = 0 }, build) {
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    build(tl);
    // Pad the timeline to exactly `anim` units so positions map 1:1 to vh.
    if (tl.duration() < anim) tl.to({}, { duration: anim - tl.duration() }, tl.duration());
    const size = () => {
      section.style.height = `${(anim + 100 + cover) * vh()}px`;
      section.style.marginTop = overlapPrev ? `${-overlapPrev * vh()}px` : '';
    };
    scenes.push(size);
    size();
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${anim * vh()}`,
      scrub: 0.6,
      animation: tl,
      // No invalidateOnRefresh: tweens use vh/% units so they scale on resize,
      // and invalidating would drop the from-states of not-yet-started scenes.
    });
    return tl;
  }
  ScrollTrigger.addEventListener('refreshInit', () => scenes.forEach((fn) => fn()));

  // ---- R1 Hero: tiles drift with parallax while the headline dims -----------
  const hero = $('.s-hero');
  const heroTitle = $('.hero-title', hero);
  // On load the headline sweeps in (the reference does this when the page opens).
  gsap.fromTo($$('.c', heroTitle), { opacity: DIM }, { opacity: 1, duration: 0.05, stagger: 0.025, ease: 'power1.out', delay: 0.2 });
  gsap.from($$('.tile', hero), { scale: 0.4, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'back.out(1.7)', delay: 0.3 });

  pinScene(hero, { anim: 160 * k, cover: 100 }, (tl) => {
    $$('.tile', hero).forEach((tile) => {
      const d = Number(tile.dataset.depth) || 1;
      const r = gsap.getProperty(tile, 'rotation');
      tl.fromTo(tile, { y: 0, rotation: r }, { y: `${-d * 32}vh`, rotation: r + d * 12, duration: 160 * k }, 0);
    });
    tl.to($('.hero-kicker', hero), { opacity: 0, y: -40, duration: 40 * k }, 0);
    tl.to($('.scroll-cue', hero), { opacity: 0, duration: 20 * k }, 0);
    // Headline reverse-reveals (dims) as the tiles drift away.
    tl.to(heroTitle, { opacity: 0.35, duration: 60 * k }, 50 * k);
    // Warm light cone shines down; the cloud then rises (price section).
    tl.to($('.hero-cone', hero), { opacity: 1, duration: 40 * k }, 115 * k);
  });

  // ---- R2 Price cloud: elements fall through the cone, headline reveals -------
  const price = $('.s-price');
  const priceTitle = $('.price-title', price);
  dimChars(priceTitle);
  // Falling pieces drift down slower than the page scrolls up (they "float").
  gsap.fromTo($$('.fall', price), { y: '-45vh', rotation: -40 }, {
    y: '12vh', rotation: 40, ease: 'none',
    scrollTrigger: { trigger: price, start: 'top bottom', end: () => `+=${200 * vh()}`, scrub: 0.6 },
  });
  pinScene(price, { anim: 90 * k, overlapPrev: 100 }, (tl) => {
    reveal(tl, priceTitle, 0, 55 * k);
    tl.fromTo($('.price-badge', price), { scale: 0, rotation: -100 }, { scale: 1, rotation: -10, duration: 12 * k, ease: 'back.out(1.6)' }, 50 * k);
    tl.fromTo($('.price-aside p', price), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 12 * k }, 55 * k);
  });

  // ---- R3 Stats: cards rise and stack into the mosaic ------------------------
  const stats = $('.s-stats');
  const cards = $$('.stat-card', stats);
  pinScene(stats, { anim: 240 * k, cover: 100 }, (tl) => {
    cards.forEach((card, i) => {
      tl.fromTo(card, { y: '110vh', rotation: i % 2 ? 6 : -6 }, { y: 0, rotation: 0, duration: 50 * k, ease: 'power3.out' }, i * 34 * k);
    });
    tl.fromTo($('.symbol-pattern', stats), { y: 0 }, { y: '-12vh', duration: 240 * k }, 0);
  });

  // ---- R4 Did you know: green slides over stats; fact reveals; pool rises -----
  const dyk = $('.s-dyk');
  const kicker = $('.dyk-kicker', dyk);
  const fact = $('.dyk-fact', dyk);
  dimChars(kicker);
  dimChars(fact);
  pinScene(dyk, { anim: 240 * k, cover: 100, overlapPrev: 100 }, (tl) => {
    reveal(tl, kicker, 0, 40 * k);
    reveal(tl, fact, 40 * k, 140 * k);
    tl.fromTo($('.dyk-foot', dyk), { opacity: 0 }, { opacity: 0.7, duration: 15 * k }, 170 * k);
    // Diver hangs above the copy, then leaves upward while the pool rises.
    tl.fromTo($('.dyk-diver', dyk), { y: 0 }, { y: '-60vh', duration: 120 * k, ease: 'power1.in' }, 80 * k);
    tl.fromTo($('.dyk-copy', dyk), { y: '6vh' }, { y: '-10vh', duration: 120 * k }, 80 * k);
    tl.fromTo($('.dyk-pool', dyk), { yPercent: 105 }, { yPercent: 0, duration: 120 * k, ease: 'power2.out' }, 90 * k);
  });

  // ---- R5 Roast: headline, then pinned horizontal track ----------------------
  const roast = $('.s-roast');
  const track = $('.roast-track', roast);
  const roastTitle = $('.roast-title', roast);
  const havocTitle = $('.havoc-title', roast);
  dimChars(roastTitle);
  dimChars(havocTitle);
  // Track travels from off-screen right until its last panel (periwinkle,
  // holding the next headline) fills the screen. Its length is measured once
  // to size the pin: ~0.8vh of scroll per 1vw of travel.
  const trackVh = (track.offsetWidth / vh()) * 0.8;
  const head = 90 * k;
  const tail = 70 * k;
  pinScene(roast, { anim: head + trackVh + tail, overlapPrev: 100 }, (tl) => {
    reveal(tl, roastTitle, 0, 60 * k);
    // CSS parks the track at left: 100vw; -100% of its own width brings the
    // final panel exactly into view. Percentages keep this right on resize.
    tl.fromTo(track, { xPercent: 0 }, { xPercent: -100, duration: trackVh }, head);
    // Headline stays put and is slowly covered; nudge it back a little.
    tl.fromTo(roastTitle, { scale: 1, opacity: 1 }, { scale: 0.92, opacity: 0.6, duration: 60 * k }, head);
    reveal(tl, havocTitle, head + trackVh, tail * 0.8);
  });

  // ---- R6 Havoc: planet rises, hotspots pop in with dotted lines -------------
  const havoc = $('.s-havoc');
  const svg = $('svg.campus', havoc);
  const spots = $$('.hotspot', svg);
  // Draw-in for dotted lines: mask each dotted path with a solid path whose
  // dashoffset animates from 1 → 0 (pathLength normalised to 1).
  const NS = 'http://www.w3.org/2000/svg';
  const defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
  const maskPaths = spots.map((g, i) => {
    const line = g.querySelector('.hotspot-line');
    const mask = document.createElementNS(NS, 'mask');
    mask.setAttribute('id', `hs-mask-${i}`);
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    const mp = document.createElementNS(NS, 'path');
    mp.setAttribute('d', line.getAttribute('d'));
    mp.setAttribute('fill', 'none');
    mp.setAttribute('stroke', '#fff');
    mp.setAttribute('stroke-width', '14');
    mp.setAttribute('pathLength', '1');
    mp.setAttribute('stroke-dasharray', '1 1');
    mp.setAttribute('stroke-dashoffset', '1');
    mask.append(mp);
    defs.append(mask);
    line.setAttribute('mask', `url(#hs-mask-${i})`);
    return mp;
  });
  const legend = $$('.campus-legend li', havoc);
  pinScene(havoc, { anim: 250 * k }, (tl) => {
    const planet = $('.campus-planet', svg);
    tl.fromTo(planet, { y: 420 }, { y: 0, duration: 80 * k, ease: 'power2.out' }, 0);
    tl.fromTo($('.campus-wrap', havoc), { scale: 0.88 }, { scale: 1.04, duration: 250 * k }, 0);
    spots.forEach((g, i) => {
      const at = (85 + i * 34) * k;
      tl.fromTo(g.querySelector('.hotspot-art'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 14 * k, ease: 'back.out(1.8)' }, at);
      tl.fromTo(maskPaths[i], { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 18 * k }, at + 6 * k);
      // Animate the inner group: the outer <g> holds the label's SVG position.
      tl.fromTo(g.querySelector('.hs-inner'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 10 * k }, at + 14 * k);
      if (legend[i]) tl.fromTo(legend[i], { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 10 * k }, at + 6 * k);
    });
    tl.fromTo($('.campus-warning', havoc), { scale: 0, rotation: -40 }, { scale: 1, rotation: 8, duration: 16 * k, ease: 'back.out(2)' }, (85 + spots.length * 34) * k);
    tl.fromTo($('.campus-center', havoc), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 12 * k }, (95 + spots.length * 34) * k);
  });

  // ---- Soft turn: slow headline, gentle parallax, nothing pops ----------------
  const memHead = $('.mem-head');
  const memTitle = $('.mem-title', memHead);
  dimChars(memTitle);
  pinScene(memHead, { anim: 130 * k }, (tl) => {
    reveal(tl, memTitle, 0, 95 * k);
    tl.fromTo($('.mem-sub', memHead), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 30 * k, ease: 'sine.out' }, 95 * k);
  });
  $$('.memory').forEach((m, i) => {
    gsap.fromTo(m, { y: 60 + (i % 2) * 40, opacity: 0 }, {
      y: (i % 2 ? -30 : 0), opacity: 1, ease: 'sine.out',
      scrollTrigger: { trigger: m, start: 'top 95%', end: 'top 35%', scrub: 1 },
    });
  });
  $$('.mem-passage p').forEach((p) => {
    gsap.fromTo(p, { opacity: 0.15, y: 24 }, {
      opacity: 1, y: 0, ease: 'sine.out',
      scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 55%', scrub: 1 },
    });
  });

  // ---- R7 Legacy: headline reveal, three cards rise staggered ----------------
  const legacy = $('.s-legacy');
  const legacyTitle = $('.legacy-title', legacy);
  dimChars(legacyTitle);
  const ltl = gsap.timeline({ scrollTrigger: { trigger: legacy, start: 'top 70%', end: 'top 15%', scrub: 0.6 } });
  reveal(ltl, legacyTitle, 0, 1);
  gsap.from($$('.cta-card', legacy), {
    y: 140, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: $('.cta-row', legacy), start: 'top 88%', toggleActions: 'play none none reverse' },
  });

  // Footer headline: a last little sweep.
  const footLine = document.querySelector('.site-footer .display');
  if (footLine) {
    gsap.from(footLine, { opacity: 0.3, y: 30, scrollTrigger: { trigger: footLine, start: 'top 90%', end: 'top 50%', scrub: 0.6 } });
  }

  // Fonts change text widths (and so the roast track length): refresh after load.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
