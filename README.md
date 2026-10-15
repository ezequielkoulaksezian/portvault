# PortVault

**Play classic games in your browser.** A hand-checked, open-source guide to WebAssembly ports of classics
like Doom, Quake, Diablo, Duke Nukem 3D, Cave Story and Halo, free or with your own game files, plus a catalog
of every native PC port, decompilation and recompilation.

**Live site:** https://portvault.vercel.app

- Browser games first: every port is opened and checked by hand, and labeled **Free** (shareware, official demo,
  freeware or open data) or **Your files** (loads the files from your own copy). Sites that stream full
  commercial games without permission are never listed.
- 300+ classic games and 400+ native PC ports, from Super Mario 64 and Ocarina of Time to Doom and Sonic Unleashed
- Live search and filters by platform, port type and features, kept in the URL so results can be shared
- A page per game: cover, facts, recommended port, every alternative, release, license and quick answers
- Light and dark themes, fast static pages, structured data (JSON-LD), `sitemap.xml`, `llms.txt`
- Catalog refreshed automatically every week

PortVault links to project pages only. It never hosts or links to ROMs, ISOs or game data: browser ports
listed as free use legally free data, and every other port needs files from a copy of the game you own.

## Stack

Next.js 15 (App Router, fully static) · TypeScript · Tailwind CSS 4 · deployed on Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: ads and donation links
npm run dev
```

## Data

| Data | Source | License |
|---|---|---|
| Browser ports (hand-verified) | `data/web-ports.json` | CC0 1.0 |
| Ports, GitHub stats, playability | [SubmitGame/awesome-decomp-games](https://github.com/SubmitGame/awesome-decomp-games) | CC0 1.0 |
| Recommended ports | [Sebastrion/awesome-unofficial-pc-ports](https://github.com/Sebastrion/awesome-unofficial-pc-ports) | MIT |
| Summaries | Wikipedia | CC BY-SA 4.0 (attributed on each page) |
| Year, developer, publisher, genre | Wikidata | CC0 1.0 |
| Cover art | Wikipedia, downloaded once into `public/covers` | Owned by the publishers; shown for identification |

See [CONTRIBUTING.md](CONTRIBUTING.md) for how the catalog is built and curated, and
[docs/PLAN.md](docs/PLAN.md) for the full project plan.

## Configuration

All settings are environment variables (see `.env.example`):

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical domain used in metadata, sitemap and Open Graph. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher ID (`ca-pub-…`). Loads the AdSense script and generates `/ads.txt`. |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | Ad unit ID for the slot at the bottom of every page. |
| `NEXT_PUBLIC_DONATE_GITHUB_SPONSORS` | GitHub Sponsors URL. |
| `NEXT_PUBLIC_DONATE_KOFI` | Ko-fi URL. |
| `NEXT_PUBLIC_DONATE_CAFECITO` | Cafecito URL (donations in Argentine pesos). |

### Enabling ads

1. Apply for AdSense with the site's domain and wait for approval.
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` in Vercel and redeploy.
3. In AdSense, turn on **Privacy & messaging → European regulations** (Google's certified consent message),
   which is required for visitors from the EEA, the UK and Switzerland.

### Enabling donations

Set any of the `NEXT_PUBLIC_DONATE_*` variables and uncomment the matching lines in `.github/FUNDING.yml`.
GitHub Sponsors is the recommended primary option (no fees on personal accounts), with Ko-fi for one-off card
or PayPal donations and Cafecito for donors in Argentina.

## License

Code: [MIT](LICENSE). Catalog data: CC0 1.0, except Wikipedia summaries (CC BY-SA 4.0).
