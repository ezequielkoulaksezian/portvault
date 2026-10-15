import catalogData from "@/data/catalog.json";
import {
  getPlatform,
  normalizeText,
  platforms,
  type GameIndexEntry,
  type Platform,
  type PortType,
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

export function recommendedPort(game: Game): Port {
  return game.ports[0];
}

export const stats = {
  games: games.length,
  ports: games.reduce((n, g) => n + g.ports.length, 0),
  platforms: new Set(games.map((g) => g.platform)).size,
};

export function searchIndex(): GameIndexEntry[] {
  return [...games].sort(byPopularity).map(indexEntry);
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
    topPort: g.ports[0]?.name ?? "",
    cover: g.cover?.url ?? null,
    search: normalizeText(
      [
        g.title,
        ...g.aka,
        ...g.ports.map((p) => `${p.name} ${p.repo ?? ""}`),
        ...g.developers,
        ...g.publishers,
        platform?.name ?? "",
        platform?.short ?? "",
        g.year ?? "",
      ].join(" "),
    ),
  };
}
