# Motion spec

Derived from `reference/video/reference.mp4` (28.2 s, 1600×1200). I extracted 113 frames at 4 fps into
`reference/frames/` and tiled them into `reference/sheets/` (4×4, frame `n` is at `t = n/4 s`).
The recording scrolls at a fairly steady speed, so seconds of video map roughly linearly onto
scroll distance. I estimate **about 1 s of video ≈ 0.5–0.6 viewport heights (vh)** from how fast
unpinned content moves through the frame. All distances below are estimates in vh.

## Global patterns

| Pattern | What the reference does | Rough numbers |
|---|---|---|
| **Text reveal** | Sweeps left to right **one character at a time**, wrapping across lines. Characters ahead of the sweep are the same colour at about 35–40 % opacity (they read as grey-green on navy and grey-blue on periwinkle). The sweep is about 6–10 characters wide, so the boundary looks soft. It is scrubbed, not timed: scrolling backwards un-reveals. | About 1.5–2 s per two-line headline, or roughly 0.8–1 vh. Linear (no easing) because it is tied to scroll. |
| **Reverse reveal** | When a section leaves, its headline fades back to the dim state while it is still pinned (the hero does this as the battery rises). | Same scrub, about 0.5 vh. |
| **Pins** | Every major section pins while its internal animation plays, then releases with ordinary scroll. | 1–3 vh per pin. |
| **Hard-edge cover** | Some transitions have no cloud. The next section simply scrolls up *over* the pinned previous one (stats → green, green → navy, solution → footer). The edge is perfectly straight. | About 1 vh. Linear. |
| **Cloud edge** | Periwinkle sections have scalloped cloud edges, bottom-heavy and soft, with a slight gradient/shadow on the lobes. | Edge height about 12–18 vh. |
| **Pop-in** | Small illustrations and labels scale from about 0.6 to 1 with a slight overshoot. | About 0.3 s each, `back.out(1.6)`. |
| **Grain** | Fine monochrome noise sits over everything and does not move. Its opacity is about 6–10 %. | — |

## Section by section (reference → ours)

### R1 · Hero "What's really inside a battery?" (f0–f6, 0–1.5 s) → **Hero "What's really inside a Legend?"**
- **Enters:** Loads already revealed. When the video loops back (f108–f111), the headline plays its char sweep on load (about 1 s, `power2.out`).
- **Pins:** About 1.5 vh.
- **Parallax:** Tilted element tiles (Pb, Zn, Cd, ×, ⚠) sit around the headline and drift up faster than the text (about 1.3× scroll speed) while slowly rotating a few degrees.
- **Rises:** The battery's top peeks in from the bottom edge (only about 15 % visible) and rises through the headline. It passes *in front of* the text, which reverse-reveals to dim as it goes.
- **Out:** The battery goes off the top. A warm light cone shines down from its base, and a periwinkle cloud mound rises from the bottom carrying falling elements.
- **Ours:** Tiles become Cf, Mg, Px, Dk, Cp and Zz. Same pin, parallax drift and headline dimming. *(An ID card originally played the battery's role; it was removed at the client's request, so the hero has no rising object.)*

### R2 · Cloud transition "When power comes at a price" (f6–f20, 1.5–5 s) → **"When six months come at a price."**
- **Enters:** A cloud mound (lobed top edge) rises from the bottom and fills about 70 % of the frame. Inside the light cone, element pieces (Hg, a cylinder, a ball, a cube, Ni) are "falling", but they move *down slower than the page moves up*, so they appear to float.
- **Text:** The headline char-reveals in dark teal as the cloud settles (f7–f11, about 1 vh).
- **Pins:** About 2 vh. During the pin a small icon (a pink "!" badge) and a 3-line paragraph pop in at the lower right (f13).
- **Out ("fall through"):** The periwinkle section scrolls away upwards. Its bottom edge is a scalloped cloud, and navy is revealed below it (f19–f20). You read it as falling through the cloud into the next layer.
- **Ours:** Our elements fall in the cone. The icon becomes a ₹ "price tag" badge, and the paragraph is our copy.

### R3 · Stats (f20–f34, 5–8.5 s) → **Stats cards**
- **Background:** Navy with a faint pattern of circled element symbols (about 4 % opacity).
- **Pins:** About 3 vh for 4 cards.
- **Cards:** Each card rises from below the viewport and settles into an offset 2×2 mosaic, slightly overlapping its neighbours ("stacking"). Order: pink, upper right (f21–f23); orange, left, overlapping pink's left edge (f23–f25); blue, below pink (f26–f28); yellow, below orange (f29–f31). Each takes about 0.6 vh with a decelerating `power3.out` feel, staggered about 0.7 vh apart.
- **Card anatomy:** A huge number, a small unit word next to it, and a tiny two-line caption under the unit.
- **Out:** The next (green) section covers it with a hard edge.
- **Ours:** Six cards (two more than the reference), in the same mosaic grid, 3 rows × 2 columns. On mobile they form a single offset column stack in which each new card overlaps the previous one by about 20 %.

### R4 · "Did you know?" (f35–f54, 8.75–13.5 s) → **Green "Did you know?"**
- **Enters:** A forest-green panel slides up over the pinned stats with a hard edge (f35–f36). A small illustration (a swimmer on a battery "diving board") is already in place near the top centre.
- **Pins:** About 3 vh.
- **Text:** "Did you know?" char-reveals (about 0.7 vh). Then the 4-line fact char-reveals more slowly (about 2 vh). The key number (`600,000`) reveals into **yellow**.
- **Parallax:** As the fact grows, the swimmer and board scroll up and out (about 1.2× speed). A perspective pool rises from the bottom (from about f43). The pool lanes have Hg tokens floating in them.
- **Out:** Navy slides up over it with a hard edge (f55).
- **Ours:** A student on a podium (a stack of case readings) above a pool filled with speech bubbles reading "building on…". The number shows in yellow.

### R5 · "Our planet pays the price" + horizontal cards (f55–f75, 13.75–18.75 s) → **"Our section paid the price." + roast cards**
- **Text:** Centred two-line headline, char reveal, about 1 vh. Then it holds about 0.5 vh.
- **Horizontal:** The page pins, and a track of tall white cards slides in from the right *over* the headline, which stays put and is gradually covered. Cards are about 28 % of the viewport width, with alternating vertical offsets (odd cards about 8 % lower). Each card has an illustration at the top, a two-line title and a tiny caption. The track translates linearly with scroll, about 1 vh of scroll per card.
- **Out:** At the end of the track a full-height **periwinkle panel** arrives from the right as the final "slide", which hands off horizontally into R6 (f74–f75).
- **Ours:** Six roast cards. The last horizontal slide is the periwinkle panel that opens "Legends wreak havoc on…".

### R6 · "Batteries wreak havoc on our planet" (f75–f97, 18.75–24.25 s) → **"Legends wreak havoc on campus"**
- **Text:** Left-aligned headline, char reveal, about 1 vh, while a big battery stands in the middle.
- **Scene:** A globe with a cream cloud rim rises from the bottom. The battery tilts (about 0° to −60°), sinks into the globe and the view zooms in (scale about 1 to 1.6). Then the hotspots pop in one after another, each with a dotted connector line that draws in. Order: top-left circle illustration plus label; right chicken plus label; left tomato plus label; bottom fish plus label; finally a warning sign pops over the battery. Each hotspot takes about 0.4 vh, and the whole pin lasts about 4 vh.
- **Out:** The periwinkle bottom cloud edge comes up (f97–f98), the same fall-through as R2.
- **Ours:** An illustrated campus "map" (library, mess, night canteen, classroom back row). A warning sign sits in the middle where every dotted line meets. Hotspots pop in with dotted SVG lines drawing in through `stroke-dashoffset`.

### R7 · "Be part of the solution" (f97–f103, 24.25–25.75 s) → **"Be part of the legacy"** (CTA)
- **Text:** Centred headline char reveal, about 0.8 vh, with a small paragraph under it.
- **Cards:** Three tall cards (white / green / white) rise from below, staggered about 0.15 vh, `power3.out`. No pin, or a very short one.
- **Out:** A navy footer slides over it with a hard edge (f103).
- **Ours:** The three cards are "Vote for the awards", "Give your friends a tagline" and "Leave a note". Each one jumps to its survey step.

### R8 · Footer (f103–f107)
- A plain navy block.
- **Ours:** The navy footer with "Legends never graduate…".

## Sections with no reference

- **The soft turn (our §7)** sits between R6 and R7. It reuses the reference's *slowest* vocabulary: navy background, a long pin, a slow char reveal (about 2 vh per line) and photo tiles that drift in with very gentle parallax (0.9–1.1×). No pops and no stacking. It is the emotional beat, so everything decelerates (`sine.out`).
- **Survey (our §8b)** comes after the CTA. It has no scroll-driven motion, so the form is never fighting the scroll. It uses only small UI transitions.

## Reduced motion and mobile

- With `prefers-reduced-motion: reduce`, nothing is pinned or scrubbed, there is no parallax, headlines render fully revealed, cards are laid out statically (the horizontal track becomes a native swipeable scroller), and there is no confetti.
- On mobile (< 768 px), pins are shorter (about 60 % of the desktop distance). The horizontal track still pins, with cards at 78 vw. The stats become a single offset column, and the hotspots on the scene become a numbered legend under the illustration so the labels stay readable.

## Comparison log (our site vs. the reference)

I recorded our site the same way as the reference: a constant-speed scroll captured as frames, turned into an mp4, then extracted with
`ffmpeg -vf fps=4,scale=800:-1` (desktop 1200×900 and phone 390×844). Frames are in `our-frames/` and contact sheets in `our-frames/sheets/`.

| Transition | First pass | Fix |
|---|---|---|
| Hero lanyard | The pink strap ran through the whole headline at load (the reference battery only peeks in). | Shortened the strap to a small loop above the card. |
| Stats cards | Cards showed in their final mosaic *before* the pin, then jumped out and back in. | Cause: `invalidateOnRefresh` re-recorded `.from()` tweens without re-rendering them. Every scrubbed tween is now a `fromTo` with vh units, and nothing invalidates. |
| Did-you-know pool | Same glitch: the pool was visible before its rise. | Same fix. |
| Roast track | The track sat at x=0 (over the headline) before the scene started. | The track is parked at `left: 100vw` in CSS and animates `xPercent` 0 → −100, which stays responsive without invalidation. |
| Havoc labels | The "Night canteen" and "Back row" labels sat under the tilted ID card. | Moved both labels below their vignettes. |
| Roast → havoc | The ID card was duplicated (one in the end panel, one in the scene). | It's now a single card that rises in with the campus scene. |
| Falling elements | Too small to read as "elements falling through the cloud". | Scaled them up about 1.4×. |

After these fixes, our recording matches the reference beat for beat. The hero card rises and the headline dims, then the cone and cloud mound arrive, then the headline reveals and the cloud edge falls through. Stat cards rise one by one into the mosaic, and the green section covers them with a hard edge. The swimmer leaves and the pool rises. Navy covers that, the headline is followed by the horizontal cards, and a periwinkle panel hands off to the scene, where the card tilts in and hotspots pop with dotted lines. The cloud then falls through into the soft section, followed by the CTA cards.

**Note on reveal granularity:** the brief says "word by word", but the reference reveals **character by character** with a soft edge about 8 characters wide, so whole words fill in progressively. I followed the reference. To make it strictly word by word, change `reveal()` in `public/js/story/motion.js` to stagger `.w` spans instead of `.c` spans.
| ID card (client feedback) | The client found the ID card uncomfortable. | Removed it from the hero and the havoc scene. The warning sign is now the scene's centre. |
| Memory photos | Real group photos were cropped hard by 4:5 tiles. | Photos now keep their own shape: 3 columns on desktop, 1 column on phones so faces stay big. |
