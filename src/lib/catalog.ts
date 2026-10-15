import catalogData from "@/data/catalog.json";
import {
  getPlatform,
  normalizeText,
  platforms,
  type GameIndexEntry,
  type Platform,
  type PortType,
  type WebAccess,
} from "@/lib/meta";

export * from "@/lib/meta";

export type Port = {
  id: string;
  name: string;
  type: PortType;
  repo: string | null;
  url: string;
  homepage: string | null;
  description: string | null;
  stars: number;
  lastCommit: string | null;
  archived: boolean;
  license: string | null;
  release: string | null;
  releaseDate: string | null;
  releaseUrl: string | null;
  playUrl: string | null;
  multiplayer: boolean;
  video: string | null;
  score: number | null;
  recommended: boolean;
};

export type WebPort = {
  id: string;
  name: string;
  url: string;
  repo: string | null;
  access: WebAccess;
  note: string;
  multiplayer: boolean;
};

export type Cover = {
  url: string;
  width: number;
  height: number;
  source: string;
  sourceUrl: string;
};

export type Game = {
  slug: string;
  title: string;
  aka: string[];
  platform: string;
  family: string;
  year: number | null;
  developers: string[];
  publishers: string[];
  genres: string[];
  summary: string | null;
  wikipedia: { title: string; url: string } | null;
  cover: Cover | null;
  types: PortType[];
  web: WebPort[];
  stars: number;
  lastUpdate: string | null;
  multiplayer: boolean;
  browser: boolean;
  ports: Port[];
};

export const catalog = catalogData as unknown as {
  generatedAt: string;
  upstream: { name: string; generatedAt: string };
  games: Game[];
};

export const games: Game[] = catalog.games;

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}

export function gamesForPlatform(slug: string): Game[] {
  return games.filter((g) => g.platform === slug).sort(byPopularity);
}

export function gamesForType(type: PortType): Game[] {
  return games.filter((g) => g.types.includes(type)).sort(byPopularity);
}

export function byPopularity(a: Game, b: Game): number {
  return b.stars - a.stars || a.title.localeCompare(b.title);
}

export function platformsInUse(): (Platform & { count: number })[] {
  const counts = new Map<string, number>();
  for (const g of games)
    counts.set(g.platform, (counts.get(g.platform) ?? 0) + 1);
  return platforms
    .filter((p) => counts.has(p.slug))
    .map((p) => ({ ...p, count: counts.get(p.slug)! }));
}

export function relatedGames(game: Game, limit = 6): Game[] {
  return games
    .filter((g) => g.slug !== game.slug && g.platform === game.platform)
    .sort(byPopularity)
    .slice(0, limit);
}

export const webGames: Game[] = games.filter((g) => g.web.length > 0);
export const nativeGames: Game[] = games.filter((g) => g.ports.length > 0);

/** Browser games first, free ones before bring-your-own-files, then by popularity. */
export function byFeatured(a: Game, b: Game): number {
  const free = (g: Game) => Number(g.web.some((w) => w.access === "free"));
  return free(b) - free(a) || byPopularity(a, b);
}

export const stats = {
  games: games.length,
  nativeGames: nativeGames.length,
  ports: games.reduce((n, g) => n + g.ports.length, 0),
  platforms: new Set(games.map((g) => g.platform)).size,
  webGames: webGames.length,
  webPorts: webGames.reduce((n, g) => n + g.web.length, 0),
  webFree: webGames.filter((g) => g.web.some((w) => w.access === "free")).length,
};

export function searchIndex(list: Game[] = games): GameIndexEntry[] {
  return [...list].sort(byPopularity).map(indexEntry);
}

export function indexEntry(g: Game): GameIndexEntry {
  const platform = getPlatform(g.platform);
  return {
    slug: g.slug,
    title: g.title,
    platform: g.platform,
    family: g.family,
    year: g.year,
    types: g.types,
    stars: g.stars,
    lastUpdate: g.lastUpdate,
    multiplayer: g.multiplayer,
    browser: g.browser,
    hasRelease: g.ports.some((p) => p.release),
    portCount: g.ports.length,
    topPort: g.ports[0]?.name ?? g.web[0]?.name ?? "",
    cover: g.cover?.url ?? null,
    webCount: g.web.length,
    webFree: g.web.some((w) => w.access === "free"),
    webOwn: g.web.some((w) => w.access === "own-files"),
    webMultiplayer: g.web.some((w) => w.multiplayer),
    playUrl: g.web[0]?.url ?? null,
    playName: g.web[0]?.name ?? null,
    search: normalizeText(
      [
        g.title,
        ...g.aka,
        ...g.ports.map((p) => `${p.name} ${p.repo ?? ""}`),
        ...g.web.map((w) => w.name),
        ...g.developers,
        ...g.publishers,
        platform?.name ?? "",
        platform?.short ?? "",
        g.year ?? "",
      ].join(" "),
    ),
  };
}
