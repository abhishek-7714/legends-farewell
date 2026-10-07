# Legends: farewell site + awards survey

A one-page scroll story for Section Legends, followed by a survey (awards, taglines, a note) and a password-protected admin page that exports palcard-ready CSV.

- **Stack:** Node 20 + Express, PostgreSQL (Replit's built-in database), plain ES-module front end (no build step), GSAP + ScrollTrigger from a CDN.
- **Public site:** `/`. **Admin:** `/admin`.

## Edit the content (no code needed)

Everything editable lives in `data/`. Restart the app after editing (on Replit, press **Stop** then **Run**; on a deployment, **Redeploy**).

| File | What's in it |
|---|---|
| `data/section.json` | `members`: the class list, one name per entry. These exact spellings appear in dropdowns, the admin page and the CSV. Names must be unique. |
| `data/awards.json` | Up to 15 awards: `id`, `title` (3 words max), `description` (one line) and an optional `emoji`. **Don't change an `id` after voting starts**, because votes are stored against it. Titles and descriptions are safe to change at any time. |
| `data/story.json` | All the copy on the site: hero, stats, roast cards, campus hotspots, memories, CTA, survey microcopy and footer. Search for `[PLACEHOLDER` to find every spot waiting for a real inside joke, name or number. In headlines, `*word*` renders that word yellow. |
| `public/img/memories/` | Photos for the memories section, listed in `sections.memories.items` in `story.json` (e.g. `"image": "/img/memories/potluck.jpg"`). Use JPGs about 1400px wide. |

## Set the admin password

In Replit, open **Tools → Secrets** and add `ADMIN_PASSWORD` with any value. Then visit `/admin`. The browser asks for a username and password; the username can be anything.
If `ADMIN_PASSWORD` is missing, `/admin` stays disabled. When you deploy, add the secret to the deployment too (Deployments → Secrets).

## Deploy on Replit

1. In Replit, choose **Create App → Import from GitHub** and pick this repo. `.replit` already sets the run command (`npm start`), Node 20 and PostgreSQL.
2. **Add the database.** Open the **Database** tool, then create a PostgreSQL database. Replit sets `DATABASE_URL` for you, and the tables are created on first start.
3. **Add the admin password.** Open **Secrets** and add `ADMIN_PASSWORD` with a strong value.
4. Press **Run**. The console should show `[db] connected and migrated`. Open the preview, cast a test vote, then check `/admin`.
5. **Deploy → Autoscale** (or Reserved VM), then **Deploy**. In the deployment's settings, make sure both `DATABASE_URL` and `ADMIN_PASSWORD` are present, and add them if they're missing. Share the `*.replit.app` URL on WhatsApp.
   - Shortcut: `https://<your-app>/#vote` opens straight on the awards.
6. Delete your test vote before sharing: **Admin → Who voted → Reset**.

To change copy later, edit the `data/*.json` files, either in Replit's editor or by pushing to GitHub and pulling in Replit, then **Redeploy**.

Submissions live in Postgres, never on the file system, so redeploys don't lose data.

## How the survey works

- Voters pick their own name. The first submission for a name stores a secret edit token on that phone (localStorage), so the same person can come back and edit until voting closes.
- If someone picks a name that has already voted from another phone, they're blocked with a friendly message. If it's genuinely them on a new phone, reset their submission in **Admin → Who voted → Reset**, and they can then vote fresh.
- The server validates everything: names must be in `section.json`, award ids must be in `awards.json`, nobody can vote for themselves, taglines are capped at 60 characters, notes at 1000, HTML is stripped, and there's an IP rate limit. The limit is 60 submits per 5 minutes per IP, which is generous because the whole class may share one campus Wi-Fi IP.
- Taglines and notes are never shown on the public site. Only `/admin` sees them.

## Admin page

- **Leaderboard:** the top 3 per award with vote counts. Ties are flagged ("TIE for 1st" or "tie at #2"). It refreshes every 15 seconds.
- **Taglines:** grouped by person, including their self-chosen one. **Hide** removes a tagline from the CSV. Hidden ones stay visible (struck through) in the admin view so you can undo.
- **Notes:** notes to the section.
- **Who voted:** submitted vs pending, a copy-paste list of who hasn't voted, and a per-person reset.
- **Voting toggle:** closes or reopens voting.
- **Download palcard CSV:** one row per classmate, with columns `Name, Self tagline, Taglines received (joined with " | "), Tagline count, Awards won, Award votes`. Tied winners are marked `(tie)`. The file is UTF-8 with a BOM, so Excel shows Hindi text and emoji correctly.

## Run locally

```bash
npm install
docker run -d --name legends-pg -e POSTGRES_PASSWORD=legends -e POSTGRES_DB=legends -p 55432:5432 postgres:16-alpine
DATABASE_URL=postgres://postgres:legends@localhost:55432/legends ADMIN_PASSWORD=dev npm run dev
npm test   # validation / ranking / CSV unit tests
```

Without `DATABASE_URL` the story still renders. The survey shows a "not connected" message instead of losing votes.

## Motion

- `MOTION.md` is the motion spec I derived from the reference video. It ends with a log comparing our own recording against the reference.
- Motion only runs when GSAP loads (from the cdnjs CDN) and the visitor hasn't set **reduce motion**. Otherwise the page shows a static layout with the same content: no pins, and the roast cards become a swipeable row.
- Scene lengths are in vh near the top of each block in `public/js/story/motion.js`. Phones automatically get about 65 % of the desktop length.

## Code map

```
server/index.js        routes, rate limits, admin auth
server/db.js           Postgres schema + queries
server/validate.js     submission validation + HTML stripping
server/results.js      leaderboard, ties, CSV
public/js/survey/      survey wizard
public/js/components/  Combobox, StatCard, RevealHeadline, FloatingTile, CloudDivider, RoastCard, …
public/js/story/       story sections + scroll animations
MOTION.md              motion spec derived from the reference video
```
