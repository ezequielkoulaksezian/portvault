# PortVault — project plan

PortVault is an open-source catalog of **native PC ports of classic games**: decompilation-based ports,
static recompilations, source ports and engine reimplementations. Each game page shows the box art,
the facts about the game and every known port with links to its repository, releases and website.

## 1. Research summary

### What counts as a "port"

| Type | What it is | Examples |
|---|---|---|
| Decompilation port | The original machine code is rewritten as matching C/C++ and then built natively for PC | Ship of Harkinian (Ocarina of Time), Starship (Star Fox 64) |
| Static recompilation | The original binary is translated automatically into native code (N64Recomp, XenonRecomp…) | Zelda 64: Recompiled, Unleashed Recompiled |
| Source port | A port of officially released or decompiled source code to modern systems | GZDoom, Ghostship, SpaghettiKart |
| Engine remake | A clean-room reimplementation of the engine that reads the original game files | OpenMW, DevilutionX, OpenRCT2 |

Nearly every port needs files from a copy of the game the player owns. PortVault never links to ROMs, ISOs or game assets.

### Data sources

1. **[SubmitGame/awesome-decomp-games](https://github.com/SubmitGame/awesome-decomp-games)** (`data/games.json`):
   about 2,100 projects, refreshed daily, with GitHub metadata, link checks and playability ratings.
   License **CC0 1.0**, so it can be reused freely. Main source.
2. **[Sebastrion/awesome-unofficial-pc-ports](https://github.com/Sebastrion/awesome-unofficial-pc-ports)**: a human-curated
   list of the most user-friendly ports. It marks the **recommended** port of each game and fills gaps.
3. Cross-checked against the [PCGamingWiki list of unofficial ports](https://www.pcgamingwiki.com/wiki/List_of_unofficial_ports),
   [readonlymemo](https://readonlymemo.com/decompilation-projects-and-n64-recompiled-list/) and
   [awesome-game-decompilations](https://github.com/CharlotteCross1998/awesome-game-decompilations).

**Inclusion criteria.** The site lists only ports that can actually be played today:
- type is decompilation, static recompilation, source port or engine remake, and the link works;
- playability rating of 4 or more;
- active projects with 30 or more stars, or finished/older projects with 300 or more stars (Cannonball, sm64ex…);
- entries the source flags as low-effort AI output need 300 or more stars;
- anything on the curated list is always included.

### Covers

Box art comes from **Wikipedia**. For each game, the build script:
1. finds the game's English Wikipedia article (exact title, then `Title (video game)`, then search) and confirms it uses `Infobox video game`;
2. reads the infobox `image` field and resolves it via the MediaWiki `imageinfo` API to a stable URL on
   `upload.wikimedia.org`, Wikimedia's CDN;
3. stores the URL and the file's description page for attribution.

Why: no API key is needed, it covers PC and console games alike, the URLs are permanent and the CDN is fast. The
alternatives were IGDB (needs Twitch API credentials) and SteamGridDB (needs an API key), which can be added later as
fallbacks; libretro-thumbnails needs exact No-Intro names and has no PC titles. Games with no match get a generated
"cartridge" placeholder in the site's style. Covers are shown at small size as identification under fair use and link
back to their source page.

The same Wikipedia/Wikidata lookup adds the release year, developer, publisher, genres and a short summary (CC BY-SA 4.0,
attributed on the page).

## 2. Product

- **Home:** headline, live search, filters and the game grid.
- **Live search:** filters as you type (title, alternative names, port names, developer). Accents and case are ignored.
- **Categories and filters:** platform (N64, PlayStation, Xbox 360, PC/DOS…), port type, features (multiplayer,
  browser-playable), and sorting (most popular, recently updated, A–Z, release year). The state lives in the URL so
  results can be shared.
- **Game page** `/games/[slug]`: cover, facts (platform, year, developer, publisher, genre), summary, the list of ports
  (recommended first) with repository, latest release, website, stars, last update and license, plus an FAQ and sources.
- **Category pages** `/platforms/[slug]` and `/types/[slug]`: SEO landing pages with intro text and a pre-filtered list.
- **About / FAQ:** what ports are, legality (bring your own copy), methodology and credits.
- **Donate:** donation links (see section 5).
- **Dark and light themes:** follows the system by default, with a manual toggle, and no flash on load.
- **Style:** modern and sober, with old-school touches: a pixel display font for headings and labels, a subtle CRT
  scanline texture, cartridge-shaped cards, and an amber arcade accent. Readable Inter body text.

## 3. SEO, AEO and GEO

- **SEO:** everything is statically generated, with metadata, canonical URLs and Open Graph/Twitter cards per page, a
  dynamic OG image per game, `sitemap.xml`, `robots.txt`, a web manifest, breadcrumbs, semantic HTML, fast Core Web
  Vitals (static pages, lazy images, reserved ad space to avoid layout shift).
- **Structured data (JSON-LD):** `WebSite` + `SearchAction`, `Organization`, `VideoGame` with its ports as
  `SoftwareApplication`, `BreadcrumbList`, `ItemList` on category pages and `FAQPage`.
- **AEO (answer engines):** every game page answers the common questions directly ("Is there a PC port of X?", "Do I
  need the original game?", "Which port should I use?") in short, quotable sentences, marked up as FAQ.
- **GEO (generative engines):** `/llms.txt` (a site summary and key pages) and `/llms-full.txt` (the whole catalog in
  Markdown), clear facts with sources and dates, and robots rules that allow AI crawlers.

## 4. Advertising (Google AdSense)

- An `<AdSlot>` component at the bottom of every page, above the footer, with reserved height so it doesn't shift the layout.
- Configured by environment variables: `NEXT_PUBLIC_ADSENSE_CLIENT` (ca-pub-…) and `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER`.
  When they're not set, nothing loads and the slot isn't shown.
- `/ads.txt` is generated from the same publisher ID.
- To get approved: the site needs real content and a privacy page (included). For visitors in the EEA, UK and Switzerland,
  Google requires a certified consent tool. Use Google's own free **Privacy & messaging** tool, which is enabled from
  AdSense and needs no code changes.

## 5. Donations — recommendation

| Option | Fees | Fit |
|---|---|---|
| **GitHub Sponsors** (primary) | 0% on personal accounts | Argentina is a supported region. The "Sponsor" button appears on the repo itself via `.github/FUNDING.yml`. Best match for an open-source audience. |
| **Ko-fi** (secondary) | 0% platform fee on donations (only PayPal/Stripe processing) | For visitors without GitHub: one-off donations by card/PayPal. |
| **Cafecito** (local) | 5% + Mercado Pago | For donors in Argentina paying in pesos. |
| Open Collective | about 8–13% (fiscal host + processing) | Only worth it with several maintainers who need transparent, shared budgets. Not for now. |

Everything is configured in `src/config/site.ts` (`donations`). The donate button and page show only the methods that
have a URL, so the site works before any account exists.

## 6. Technical architecture

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS 4**, fully static (SSG), deployed on Vercel.
- `scripts/build-catalog.mjs` (Node, no dependencies): download sources → filter → normalize platforms → group by game →
  enrich with Wikipedia/Wikidata (results cached in `data/enrichment-cache.json`, manual fixes in `data/overrides.json`)
  → write `src/data/catalog.json`.
- **Weekly GitHub Action:** rebuilds the catalog and commits any changes, which triggers an automatic Vercel deploy.
- Client-side search on a precomputed index (a few hundred games, so no server needed).
- **Open source:** MIT license for the code; the data inherits CC0 (catalog) and CC BY-SA (Wikipedia summaries). Includes
  CONTRIBUTING, issue templates (suggest a port, report a problem) and FUNDING.yml.

## 7. Delivery steps

1. Research and plan (this document).
2. Data pipeline and the first catalog.
3. Design system, layout, theme, header and footer.
4. Home page with live search and filters.
5. Game pages with cover, details, ports and FAQ.
6. Category pages, About/FAQ, Privacy and Donate.
7. SEO/AEO/GEO: metadata, JSON-LD, sitemap, robots, OG images, llms.txt.
8. AdSense slot and ads.txt.
9. README, CONTRIBUTING, FUNDING, GitHub Action.
10. Lint, build, visual checks on desktop and mobile in both themes, Lighthouse, deploy to Vercel at `portvault.vercel.app`.
