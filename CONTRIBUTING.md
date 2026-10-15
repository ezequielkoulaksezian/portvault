# Contributing to PortVault

Thanks for helping. The quickest ways to contribute are opening an issue to
[suggest a port](../../issues/new?template=suggest-port.yml) or
[report a problem](../../issues/new?template=port-report.yml).

## Ground rules

- Never add links to ROMs, ISOs, game assets or sites that distribute them.
- A port must be playable today and target PC (Windows, Linux, macOS) or phones.
- Browser ports (`data/web-ports.json`) must run the game's engine in the browser and either use legally free
  data (`"access": "free"`: shareware, official demo, freeware, open assets) or ask for the player's own files
  (`"access": "own-files"`). Verify which data a "free" port loads before adding it.
- Mods, randomizers, server emulators and original fan games are out of scope.

## How the catalog is built

`scripts/build-catalog.mjs` produces `src/data/catalog.json`:

1. downloads [awesome-decomp-games](https://github.com/SubmitGame/awesome-decomp-games) (`data/games.json`, CC0);
2. keeps playable ports that pass the quality filter (`isPlayablePort`);
3. adds the recommended ports from `data/curated.json`;
4. adds the hand-listed ports in `overrides.extraPorts` and the browser ports in `data/web-ports.json`;
5. applies the rules in `data/overrides.json`;
6. groups ports by game and enriches each game from Wikipedia and Wikidata. Results are cached in
   `data/enrichment-cache.json`.

### `data/overrides.json`

| Key | Purpose |
|---|---|
| `exclude` | Repositories (`owner/name`) that must never be listed. |
| `ports` | Per-repository fixes: `name`, `game` (string or list), `platform`, `type`, `description`, `recommended`. |
| `extraPorts` | Ports missing from the upstream database: `repo`, `name`, `game`, `type`, optional `recommended`. |
| `aliases` | Maps a normalized title (lowercase letters and digits only) to the canonical game title, to merge projects under one game. |
| `games` | Per-game fixes keyed by slug: `exclude`, `title`, `platform` (slug from `data/platforms.json`), `wikipedia` (exact article title, or `false`), `aka`, `cover`, `year`, `summary`. |

## Local development

```bash
npm install
npm run dev                         # http://localhost:3000
node scripts/build-catalog.mjs      # rebuild the catalog (uses the cache)
node scripts/build-catalog.mjs --report    # also print the selection for review
node scripts/build-catalog.mjs --refresh   # re-query Wikipedia/Wikidata for every game
```

Before opening a pull request, run `npm run lint`, `npx tsc --noEmit` and `npm run build`.
