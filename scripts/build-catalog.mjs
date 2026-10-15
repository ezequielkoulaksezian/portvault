#!/usr/bin/env node
// Builds src/data/catalog.json from the upstream port database, the curated list and
// manual overrides, then enriches every game with Wikipedia/Wikidata facts and cover art.
//
//   node scripts/build-catalog.mjs            use the enrichment cache
//   node scripts/build-catalog.mjs --refresh  re-query Wikipedia/Wikidata for every game
//   node scripts/build-catalog.mjs --report   also print the selection for review

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const UPSTREAM_URL =
  "https://raw.githubusercontent.com/SubmitGame/awesome-decomp-games/main/data/games.json";
const USER_AGENT = "PortVault/1.0 (https://github.com/ezequielkoulaksezian/portvault)";
const PORT_TYPES = new Set(["decompilation", "static-recomp", "source-port", "engine-remake"]);
const ARGS = new Set(process.argv.slice(2));

const readJson = async (file) => JSON.parse(await readFile(path.join(ROOT, file), "utf8"));
const writeJson = async (file, data) => {
  await mkdir(path.dirname(path.join(ROOT, file)), { recursive: true });
  await writeFile(path.join(ROOT, file), JSON.stringify(data, null, 2) + "\n");
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const normalize = (s) =>
  (s || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

const slugify = (s) =>
  (s || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------------------------------------------------------------- GitHub

function githubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return null;
  }
}

async function githubRepo(fullName, token) {
  const res = await fetch(`https://api.github.com/repos/${fullName}`, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return null;
  const repo = await res.json();
  let release = null;
  const rel = await fetch(`https://api.github.com/repos/${repo.full_name}/releases/latest`, {
    headers: { "User-Agent": USER_AGENT, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (rel.ok) release = await rel.json();
  return {
    repo: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    homepage: repo.homepage || null,
    stars: repo.stargazers_count,
    lastCommit: repo.pushed_at,
    archived: repo.archived,
    license: repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : null,
    release: release?.tag_name ?? null,
    releaseDate: release?.published_at ?? null,
    releaseUrl: release?.html_url ?? null,
  };
}

// ---------------------------------------------------------------- Platforms

function platformResolver(platforms) {
  const table = new Map();
  for (const p of platforms) for (const m of p.match) table.set(m, p.slug);
  return (raw) => {
    const key = (raw || "").trim().toLowerCase();
    if (table.has(key)) return table.get(key);
    const first = key.split(/[/,]/)[0].trim();
    return table.get(first) ?? "pc";
  };
}

// ---------------------------------------------------------------- Selection

function portNameFromTitle(title) {
  const m = title.match(/^(.*?)\s*\((.+)\)\s*$/);
  return m ? { game: m[1].trim(), name: m[2].trim() } : { game: title.trim(), name: null };
}

// Ports whose target is another console or handheld rather than PC/phones.
const NON_PC_TARGET = /(^|[-_/])(3ds|nds|psp|vita|psvita|wiiu|switch-port|uefi)([-_.]|$)/i;

function isPlayablePort(x) {
  if (!PORT_TYPES.has(x.type) || !x.link_ok) return false;
  if (NON_PC_TARGET.test(x.repo ?? "")) return false;
  if ((x.ratings?.playability ?? 0) < 4) return false;
  const stars = x.stars ?? 0;
  if (x.ai_flag && stars < 300) return false;
  return x.inactive ? stars >= 300 : stars >= 30;
}

function toPort(x, extra = {}) {
  const parsed = portNameFromTitle(x.title);
  return {
    id: x.id,
    name: parsed.name ?? x.title,
    gameTitle: parsed.game,
    rawPlatform: x.platform,
    type: x.type,
    repo: x.repo,
    url: x.url,
    homepage: x.homepage || null,
    description: x.note || x.description || null,
    stars: x.stars ?? 0,
    lastCommit: x.last_commit ?? null,
    archived: !!x.archived,
    license: x.license && x.license !== "NOASSERTION" ? x.license : null,
    release: x.release ?? null,
    releaseDate: x.release_date ?? null,
    releaseUrl: x.release_url ?? null,
    playUrl: null,
    multiplayer: x.multiplayer === true,
    video: x.video ?? null,
    score: x.score ?? null,
    recommended: false,
    ...extra,
  };
}

// ---------------------------------------------------------------- Wikipedia / Wikidata

async function api(url, params) {
  const qs = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${url}?${qs}`, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) return res.json();
    await sleep(1500 * (attempt + 1));
  }
  throw new Error(`Request failed: ${url}?${qs}`);
}
const wiki = (params) => api("https://en.wikipedia.org/w/api.php", { action: "query", ...params });

const INFOBOX = /\{\{\s*Infobox[ _](?:video[ _]game|VG)\s*(\||\n|<!--)/i;
const ANY_INFOBOX = /\{\{\s*Infobox[ _](?:video[ _]game|VG|software)\s*(\||\n|<!--)/i;
const stripParens = (t) => t.replace(/\s*\([^)]*\)\s*$/, "");

async function fetchPages(titles) {
  const data = await wiki({
    titles: titles.join("|"),
    redirects: "1",
    prop: "revisions|pageprops|extracts|info",
    rvprop: "content",
    rvslots: "main",
    rvsection: "0",
    ppprop: "wikibase_item|disambiguation",
    exintro: "1",
    explaintext: "1",
    exsentences: "3",
    inprop: "url",
  });
  const order = new Map(titles.map((t, i) => [t, i]));
  const resolve = (t) => {
    let cur = t;
    for (const n of data.query?.normalized ?? []) if (n.from === cur) cur = n.to;
    for (const r of data.query?.redirects ?? []) if (r.from === cur) cur = r.to;
    return cur;
  };
  const byTitle = new Map((data.query?.pages ?? []).map((p) => [p.title, p]));
  return titles
    .map((t) => byTitle.get(resolve(t)))
    .filter((p) => p && !p.missing && !p.pageprops?.disambiguation)
    .map((p) => ({ page: p, wikitext: p.revisions?.[0]?.slots?.main?.content ?? "" }))
    .sort((a, b) => (order.get(a.page.title) ?? 99) - (order.get(b.page.title) ?? 99));
}

async function findArticle(game) {
  const want = normalize(game.title);
  const valid = ({ page, wikitext }) => INFOBOX.test(wikitext) && page.ns === 0;

  if (game.wikipedia) {
    const [hit] = await fetchPages([game.wikipedia]);
    return hit && ANY_INFOBOX.test(hit.wikitext) ? hit : null;
  }

  const exact = await fetchPages([`${game.title} (video game)`, game.title]);
  const direct = exact.find(valid);
  if (direct) return direct;

  const search = await wiki({ list: "search", srsearch: `${game.title} video game`, srlimit: "6" });
  const candidates = (search.query?.search ?? [])
    .map((r) => r.title)
    .filter((t) => normalize(stripParens(t)) === want);
  if (!candidates.length) return null;
  return (await fetchPages(candidates)).find(valid) ?? null;
}

function infoboxImage(wikitext) {
  const m = wikitext.match(/\|\s*image\s*=\s*(?:\[\[\s*(?:File|Image)\s*:)?\s*([^|\]\n{}]+?\.(?:png|jpe?g|gif|webp|svg))/i);
  return m ? m[1].trim() : null;
}

async function coverFor(file) {
  if (!file) return null;
  const data = await wiki({
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "url|size",
    iiurlwidth: "480",
  });
  const info = data.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) return null;
  const clean = (u) => u?.split("?")[0];
  const width = info.thumbwidth ?? info.width;
  const height = info.thumbheight ?? info.height;
  return {
    url: clean(info.thumburl ?? info.url),
    width,
    height,
    source: "Wikipedia",
    sourceUrl: clean(info.descriptionurl),
  };
}

async function wikidataFacts(qids) {
  const facts = new Map();
  const labelIds = new Set();
  for (let i = 0; i < qids.length; i += 50) {
    const batch = qids.slice(i, i + 50);
    const data = await api("https://www.wikidata.org/w/api.php", {
      action: "wbgetentities",
      ids: batch.join("|"),
      props: "claims",
    });
    for (const [id, entity] of Object.entries(data.entities ?? {})) {
      const claims = entity.claims ?? {};
      const items = (p) =>
        (claims[p] ?? [])
          .map((c) => c.mainsnak?.datavalue?.value?.id)
          .filter(Boolean)
          .slice(0, 4);
      const years = (claims.P577 ?? [])
        .map((c) => c.mainsnak?.datavalue?.value?.time)
        .filter(Boolean)
        .map((t) => Number(t.slice(1, 5)))
        .filter((y) => y > 1950);
      const f = {
        year: years.length ? Math.min(...years) : null,
        developers: items("P178"),
        publishers: items("P123"),
        genres: items("P136"),
      };
      [...f.developers, ...f.publishers, ...f.genres].forEach((q) => labelIds.add(q));
      facts.set(id, f);
    }
    await sleep(200);
  }
  const labels = new Map();
  const ids = [...labelIds];
  for (let i = 0; i < ids.length; i += 50) {
    const data = await api("https://www.wikidata.org/w/api.php", {
      action: "wbgetentities",
      ids: ids.slice(i, i + 50).join("|"),
      props: "labels",
      languages: "en",
    });
    for (const [id, e] of Object.entries(data.entities ?? {})) {
      if (e.labels?.en?.value) labels.set(id, e.labels.en.value);
    }
    await sleep(200);
  }
  const label = (q) => labels.get(q);
  for (const [id, f] of facts) {
    facts.set(id, {
      year: f.year,
      developers: f.developers.map(label).filter(Boolean),
      publishers: f.publishers.map(label).filter(Boolean),
      genres: f.genres.map(label).filter(Boolean).map((g) => g.replace(/ video game$/i, "")),
    });
  }
  return facts;
}

async function enrich(games, cache, refresh) {
  let done = 0;
  for (const game of games) {
    done++;
    const cached = cache[game.slug];
    const key = String(game.wikipedia ?? game.title);
    if (cached && cached.key === key && !refresh) continue;
    try {
      const hit = game.wikipedia === false ? null : await findArticle(game);
      if (!hit) {
        cache[game.slug] = { key, wikipedia: null, checkedAt: new Date().toISOString() };
      } else {
        const cover = await coverFor(infoboxImage(hit.wikitext));
        cache[game.slug] = {
          key,
          wikipedia: { title: hit.page.title, url: hit.page.fullurl },
          qid: hit.page.pageprops?.wikibase_item ?? null,
          summary: hit.page.extract?.trim() || null,
          cover,
          checkedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn(`  ! ${game.title}: ${err.message}`);
    }
    if (done % 25 === 0) console.log(`  enriched ${done}/${games.length}`);
    await sleep(120);
  }

  const qids = [...new Set(games.map((g) => cache[g.slug]?.qid).filter(Boolean))];
  const missing = qids.filter((q) => refresh || !Object.values(cache).some((c) => c.qid === q && c.facts));
  if (missing.length) {
    const facts = await wikidataFacts(missing);
    for (const entry of Object.values(cache)) {
      if (entry.qid && facts.has(entry.qid)) entry.facts = facts.get(entry.qid);
    }
  }
}

// ---------------------------------------------------------------- Covers

/**
 * Downloads every cover once into public/covers so the site never hotlinks Wikimedia (which rate-limits
 * bursts of image requests). Existing files are kept; returns the local path for each game.
 */
async function downloadCovers(list, cache) {
  const dir = path.join(ROOT, "public/covers");
  await mkdir(dir, { recursive: true });
  const local = new Map();
  let fetched = 0;
  for (const game of list) {
    const remote = cache[game.slug]?.cover?.url;
    if (!remote) continue;
    const ext = path.extname(new URL(remote).pathname).toLowerCase().replace(".jpeg", ".jpg") || ".jpg";
    const file = `${game.slug}${ext}`;
    const target = path.join(dir, file);
    const exists = await access(target).then(() => true, () => false);
    if (!exists) {
      let ok = false;
      for (let attempt = 0; attempt < 5 && !ok; attempt++) {
        const res = await fetch(remote, { headers: { "User-Agent": USER_AGENT } });
        if (res.ok) {
          await writeFile(target, Buffer.from(await res.arrayBuffer()));
          ok = true;
          fetched++;
        } else {
          await sleep(2000 * (attempt + 1));
        }
      }
      if (!ok) {
        console.warn(`  ! cover download failed: ${game.slug}`);
        continue;
      }
      await sleep(250);
    }
    local.set(game.slug, `/covers/${file}`);
  }
  console.log(`Covers: ${local.size} available, ${fetched} downloaded.`);
  return local;
}

// ---------------------------------------------------------------- Main

async function main() {
  const platforms = await readJson("data/platforms.json");
  const curated = await readJson("data/curated.json");
  const webPorts = await readJson("data/web-ports.json");
  const overrides = await readJson("data/overrides.json");
  const cache = await readJson("data/enrichment-cache.json").catch(() => ({}));
  const resolvePlatform = platformResolver(platforms);
  const token = githubToken();

  console.log("Downloading upstream database…");
  const upstream = await (await fetch(UPSTREAM_URL, { headers: { "User-Agent": USER_AGENT } })).json();
  const byRepo = new Map(upstream.games.filter((x) => x.repo).map((x) => [x.repo.toLowerCase(), x]));

  const excluded = new Set(overrides.exclude.map((r) => r.toLowerCase()));
  const portOverrides = Object.fromEntries(
    Object.entries(overrides.ports).map(([k, v]) => [k.toLowerCase(), v]),
  );

  // 1. Ports that pass the quality filter.
  const ports = new Map();
  for (const x of upstream.games) {
    if (!x.repo || excluded.has(x.repo.toLowerCase())) continue;
    if (isPlayablePort(x) || portOverrides[x.repo.toLowerCase()]?.include) {
      ports.set(x.repo.toLowerCase(), toPort(x));
    }
  }

  // 2. Curated recommendations: always included, flagged as recommended.
  for (const entry of curated) {
    for (const rec of entry.recommended) {
      if (!rec.repo) {
        const id = `${slugify(entry.game)}-${slugify(rec.name)}`;
        ports.set(id, {
          id,
          name: rec.name,
          gameTitle: entry.game,
          rawPlatform: rec.platform ?? "",
          type: rec.type ?? "source-port",
          repo: null,
          url: rec.url,
          homepage: rec.url,
          description: rec.description ?? null,
          stars: 0,
          lastCommit: null,
          archived: false,
          license: null,
          release: null,
          releaseDate: null,
          releaseUrl: null,
          playUrl: null,
          multiplayer: false,
          video: null,
          score: null,
          recommended: true,
        });
        continue;
      }
      let key = rec.repo.toLowerCase();
      let x = byRepo.get(key);
      if (!x) {
        const gh = await githubRepo(rec.repo, token);
        if (gh) {
          key = gh.repo.toLowerCase();
          x = byRepo.get(key);
          if (!x) {
            ports.set(key, {
              id: slugify(gh.repo),
              name: rec.name,
              gameTitle: entry.game,
              rawPlatform: rec.platform ?? "",
              type: rec.type ?? "source-port",
              ...gh,
              description: rec.description ?? gh.description,
              playUrl: null,
              multiplayer: false,
              video: null,
              score: null,
              recommended: true,
            });
            continue;
          }
        } else {
          console.warn(`  ! curated repo not found: ${rec.repo}`);
          continue;
        }
      }
      if (excluded.has(key)) continue;
      const port = ports.get(key) ?? toPort(x);
      port.recommended = true;
      port.gameTitle = entry.game;
      if (rec.platform) port.rawPlatform = rec.platform;
      ports.set(key, port);
    }
  }

  // 2b. Ports missing from the upstream database, listed by hand.
  for (const extra of overrides.extraPorts ?? []) {
    const gh = await githubRepo(extra.repo, token);
    if (!gh) {
      console.warn(`  ! extra repo not found: ${extra.repo}`);
      continue;
    }
    const key = gh.repo.toLowerCase();
    if (ports.has(key)) {
      const existing = ports.get(key);
      existing.recommended = existing.recommended || !!extra.recommended;
      if (extra.description) existing.description = extra.description;
      continue;
    }
    ports.set(key, {
      id: slugify(gh.repo),
      name: extra.name,
      gameTitle: extra.game,
      rawPlatform: extra.platform ?? "",
      type: extra.type,
      ...gh,
      description: extra.description ?? gh.description,
      playUrl: null,
      multiplayer: false,
      video: null,
      score: null,
      recommended: !!extra.recommended,
    });
  }

  // 3. Manual corrections per port.
  for (const [key, port] of ports) {
    const o = portOverrides[key];
    if (!o) continue;
    if (o.name) port.name = o.name;
    if (o.game) port.gameTitle = o.game;
    if (o.platform) port.rawPlatform = o.platform;
    if (o.type) port.type = o.type;
    if (o.description) port.description = o.description;
    if (o.recommended !== undefined) port.recommended = o.recommended;
  }

  // 4. Group into games.
  const games = new Map();
  for (const port of ports.values()) {
    const titles = Array.isArray(port.gameTitle) ? port.gameTitle : [port.gameTitle];
    for (const title of titles) {
      const alias = overrides.aliases?.[normalize(title)];
      const gameTitle = alias ?? title;
      const slug = slugify(gameTitle);
      if (!games.has(slug)) games.set(slug, { slug, title: gameTitle, ports: [] });
      const entry = { ...port, platformSlug: resolvePlatform(port.rawPlatform) };
      if (!PORT_TYPES.has(entry.type)) entry.type = "source-port";
      delete entry.gameTitle;
      delete entry.rawPlatform;
      games.get(slug).ports.push(entry);
    }
  }

  const unusedOverrides = new Set(Object.keys(overrides.games ?? {}));
  for (const game of [...games.values()]) {
    const o = overrides.games?.[game.slug] ?? {};
    unusedOverrides.delete(game.slug);
    if (o.exclude) {
      games.delete(game.slug);
      continue;
    }
    const counts = new Map();
    for (const p of game.ports) counts.set(p.platformSlug, (counts.get(p.platformSlug) ?? 0) + 1);
    game.platform = o.platform ?? [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    game.o = o;
    if (o.title) {
      game.title = o.title;
      games.delete(game.slug);
      game.slug = slugify(o.title);
      games.set(game.slug, game);
    }
    if (o.wikipedia !== undefined) game.wikipedia = o.wikipedia;
    if (o.aka) game.aka = o.aka;
  }

  // 4b. Browser-playable ports (hand-verified in data/web-ports.json). They can create games of their own.
  for (const w of webPorts) {
    const title = overrides.aliases?.[normalize(w.game)] ?? w.game;
    const slug = slugify(title);
    let game = games.get(slug);
    unusedOverrides.delete(slug);
    if (!game) {
      const o = overrides.games?.[slug] ?? {};
      if (o.exclude) continue;
      game = { slug, title: o.title ?? title, ports: [], platform: o.platform ?? w.platform, o, web: [] };
      if (o.wikipedia !== undefined) game.wikipedia = o.wikipedia;
      if (o.aka) game.aka = o.aka;
      games.set(slug, game);
    }
    game.web ??= [];
    game.web.push({
      id: `web-${slugify(w.name)}`,
      name: w.name,
      url: w.url,
      repo: w.repo ?? null,
      access: w.access,
      note: w.note,
      multiplayer: !!w.multiplayer,
    });
  }

  if (unusedOverrides.size) console.log(`  overrides with no matching game: ${[...unusedOverrides].join(", ")}`);

  const list = [...games.values()].sort((a, b) => a.title.localeCompare(b.title));
  console.log(`Selected ${ports.size} ports across ${list.length} games.`);

  // 5. Enrichment.
  if (!ARGS.has("--no-enrich")) {
    console.log("Enriching with Wikipedia and Wikidata…");
    await enrich(list, cache, ARGS.has("--refresh"));
    await writeJson("data/enrichment-cache.json", cache);
  }

  const localCovers = await downloadCovers(list, cache);

  // 6. Final shape.
  const platformBySlug = new Map(platforms.map((p) => [p.slug, p]));
  const catalog = list.map((game) => {
    const o = game.o ?? {};
    const e = cache[game.slug] ?? {};
    const facts = e.facts ?? {};
    const portsSorted = game.ports
      .filter((p, i, arr) => arr.findIndex((q) => q.id === p.id) === i)
      .sort(
        (a, b) =>
          Number(b.recommended) - Number(a.recommended) ||
          Number(!!(b.release || b.playUrl)) - Number(!!(a.release || a.playUrl)) ||
          b.stars - a.stars,
      );
    // Ports that share a name inside one game are told apart by the repository owner.
    const renamed = portsSorted.map((p) => {
      const twins = portsSorted.filter((q) => q.name === p.name && q.repo);
      if (twins.length < 2 || !p.repo) return p.name;
      const [owner, repoName] = p.repo.split("/");
      const sameOwner = twins.every((q) => q.repo.split("/")[0] === owner);
      return `${p.name} (${sameOwner ? repoName : owner})`;
    });
    portsSorted.forEach((p, i) => (p.name = renamed[i]));
    const lastUpdate = portsSorted
      .map((p) => p.releaseDate ?? p.lastCommit)
      .filter(Boolean)
      .sort()
      .at(-1);
    return {
      slug: game.slug,
      title: game.title,
      aka: game.aka ?? [],
      platform: game.platform,
      family: platformBySlug.get(game.platform)?.family ?? "Computers",
      year: o.year ?? facts.year ?? null,
      developers: o.developers ?? facts.developers ?? [],
      publishers: o.publishers ?? facts.publishers ?? [],
      genres: o.genres ?? facts.genres ?? [],
      summary: o.summary ?? e.summary ?? null,
      wikipedia: e.wikipedia ?? null,
      cover:
        o.cover === null
          ? null
          : (o.cover ?? (e.cover && localCovers.has(game.slug) ? { ...e.cover, url: localCovers.get(game.slug) } : null)),
      types: [...new Set(portsSorted.map((p) => p.type))],
      web: (game.web ?? []).sort((a, b) => Number(a.access !== "free") - Number(b.access !== "free")),
      stars: portsSorted.reduce((n, p) => n + p.stars, 0),
      lastUpdate: lastUpdate ?? null,
      multiplayer: portsSorted.some((p) => p.multiplayer) || (game.web ?? []).some((w) => w.multiplayer),
      browser: (game.web ?? []).length > 0,
      ports: portsSorted.map((p) => {
        const copy = { ...p };
        delete copy.platformSlug;
        return copy;
      }),
    };
  });

  // Keep the previous date when nothing changed, so the weekly job only commits real updates.
  const previous = await readJson("src/data/catalog.json").catch(() => null);
  const unchanged = previous && JSON.stringify(previous.games) === JSON.stringify(catalog);
  await writeJson("src/data/catalog.json", {
    generatedAt: unchanged ? previous.generatedAt : new Date().toISOString(),
    upstream: unchanged
      ? previous.upstream
      : { name: "SubmitGame/awesome-decomp-games", generatedAt: upstream.generated_at },
    games: catalog,
  });

  const withCover = catalog.filter((g) => g.cover).length;
  const withWiki = catalog.filter((g) => g.wikipedia).length;
  console.log(
    `Wrote ${catalog.length} games · ${withWiki} matched on Wikipedia · ${withCover} with cover art.`,
  );

  if (ARGS.has("--report")) {
    for (const g of catalog) {
      console.log(
        [g.slug, g.platform, g.year ?? "-", g.wikipedia?.title ?? "NO-WIKI", g.cover ? "cover" : "NO-COVER",
          g.ports.map((p) => `${p.name}[${p.type}${p.recommended ? "*" : ""}]`).join(", ")].join(" | "),
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
