"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { families, normalizeText, platforms, portTypeList, type GameIndexEntry, type PortType } from "@/lib/meta";
import { familyColor } from "@/components/badges";
import { GameCard } from "@/components/game-card";

type Sort = "popular" | "updated" | "az" | "oldest" | "newest";

type Filters = {
  q: string;
  family: string;
  platform: string;
  types: PortType[];
  multiplayer: boolean;
  browser: boolean;
  release: boolean;
  sort: Sort;
};

const EMPTY: Filters = {
  q: "",
  family: "",
  platform: "",
  types: [],
  multiplayer: false,
  browser: false,
  release: false,
  sort: "popular",
};

const PAGE_SIZE = 48;

const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "updated", label: "Recently updated" },
  { value: "az", label: "A–Z" },
  { value: "oldest", label: "Oldest games" },
  { value: "newest", label: "Newest games" },
];

function readUrl(): Filters {
  const p = new URLSearchParams(window.location.search);
  const sort = p.get("sort") as Sort | null;
  return {
    q: p.get("q") ?? "",
    family: p.get("family") ?? "",
    platform: p.get("platform") ?? "",
    types: (p.get("type")?.split(",").filter(Boolean) as PortType[]) ?? [],
    multiplayer: p.get("mp") === "1",
    browser: p.get("web") === "1",
    release: p.get("release") === "1",
    sort: SORTS.some((s) => s.value === sort) ? (sort as Sort) : "popular",
  };
}

function writeUrl(f: Filters) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.family) p.set("family", f.family);
  if (f.platform) p.set("platform", f.platform);
  if (f.types.length) p.set("type", f.types.join(","));
  if (f.multiplayer) p.set("mp", "1");
  if (f.browser) p.set("web", "1");
  if (f.release) p.set("release", "1");
  if (f.sort !== "popular") p.set("sort", f.sort);
  const qs = p.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
}

function relevance(g: GameIndexEntry, tokens: string[], phrase: string): number {
  const title = normalizeText(g.title);
  if (title === phrase) return 1000;
  let score = 0;
  if (title.startsWith(phrase)) score += 400;
  else if (title.includes(phrase)) score += 250;
  for (const t of tokens) {
    if (title.split(" ").some((w) => w.startsWith(t))) score += 60;
  }
  return score + Math.log10(g.stars + 10);
}

const SORTERS: Record<Sort, (a: GameIndexEntry, b: GameIndexEntry) => number> = {
  popular: (a, b) => b.stars - a.stars,
  updated: (a, b) => (b.lastUpdate ?? "").localeCompare(a.lastUpdate ?? ""),
  az: (a, b) => a.title.localeCompare(b.title),
  oldest: (a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title),
  newest: (a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title),
};

export function GameBrowser({ entries }: { entries: GameIndexEntry[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(filters.q);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilters(readUrl());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeUrl(filters);
  }, [filters, ready]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const update = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setVisible(PAGE_SIZE);
  };

  // Each facet is counted against every other active filter, so the numbers show what a click would give.
  const matches = useMemo(() => {
    const phrase = normalizeText(deferredQuery);
    const tokens = phrase.split(" ").filter(Boolean);
    const test = (g: GameIndexEntry, skip?: "family" | "platform" | "types") => {
      if (tokens.length && !tokens.every((t) => g.search.includes(t))) return false;
      if (skip !== "family" && skip !== "platform" && filters.family && g.family !== filters.family) return false;
      if (skip !== "platform" && filters.platform && g.platform !== filters.platform) return false;
      if (skip !== "types" && filters.types.length && !filters.types.some((t) => g.types.includes(t))) return false;
      if (filters.multiplayer && !g.multiplayer) return false;
      if (filters.browser && !g.browser) return false;
      if (filters.release && !g.hasRelease) return false;
      return true;
    };

    let results = entries.filter((g) => test(g));
    if (tokens.length && filters.sort === "popular") {
      const scored = new Map(results.map((g) => [g.slug, relevance(g, tokens, phrase)]));
      results = results.sort((a, b) => scored.get(b.slug)! - scored.get(a.slug)!);
    } else {
      results = results.sort(SORTERS[filters.sort]);
    }

    const familyCounts = new Map<string, number>();
    const platformCounts = new Map<string, number>();
    const typeCounts = new Map<string, number>();
    for (const g of entries) {
      if (test(g, "family")) familyCounts.set(g.family, (familyCounts.get(g.family) ?? 0) + 1);
      if (test(g, "platform") && (!filters.family || g.family === filters.family))
        platformCounts.set(g.platform, (platformCounts.get(g.platform) ?? 0) + 1);
      if (test(g, "types")) for (const t of g.types) typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
    }
    return { results, familyCounts, platformCounts, typeCounts };
  }, [entries, deferredQuery, filters]);

  const activeCount =
    (filters.q ? 1 : 0) +
    (filters.family ? 1 : 0) +
    (filters.platform ? 1 : 0) +
    filters.types.length +
    Number(filters.multiplayer) +
    Number(filters.browser) +
    Number(filters.release);

  const familyPlatforms = platforms.filter(
    (p) => p.family === filters.family && (matches.platformCounts.get(p.slug) ?? 0) > 0,
  );

  return (
    <div>
      <div className="rounded-lg border border-line bg-surface p-3 shadow-card sm:p-4">
        <label htmlFor="game-search" className="sr-only">
          Search games and ports
        </label>
        <div className="relative">
          <svg
            viewBox="0 0 16 16"
            width="18"
            height="18"
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            fill="currentColor"
            shapeRendering="crispEdges"
          >
            <path d="M6 1h4v1h1v1h1v1h1v4h-1v1h-1v1h-1v1H6v-1H5v-1H4V8H3V4h1V3h1V2h1V1zm0 2v1H5v4h1v1h4V8h1V4h-1V3H6z" />
            <path d="M11 11h1v1h1v1h1v1h1v1h-2v-1h-1v-1h-1v-1h-1v-1z" />
          </svg>
          <input
            ref={inputRef}
            id="game-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search games, ports or developers…"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            className="h-12 w-full rounded-md border border-line bg-bg-elevated pl-11 pr-20 text-base text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          {filters.q ? (
            <button
              type="button"
              onClick={() => {
                update({ q: "" });
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink"
            >
              Clear
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted sm:block">
              /
            </kbd>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <FilterRow label="Platform">
            <Chip active={!filters.family} onClick={() => update({ family: "", platform: "" })}>
              All
            </Chip>
            {families.map((family) => {
              const count = matches.familyCounts.get(family) ?? 0;
              if (!count && filters.family !== family) return null;
              return (
                <Chip
                  key={family}
                  active={filters.family === family}
                  onClick={() =>
                    update(filters.family === family ? { family: "", platform: "" } : { family, platform: "" })
                  }
                  count={count}
                  dot={familyColor(family)}
                >
                  {family}
                </Chip>
              );
            })}
          </FilterRow>

          {filters.family && familyPlatforms.length > 1 && (
            <FilterRow label="System">
              <Chip active={!filters.platform} onClick={() => update({ platform: "" })}>
                Any {filters.family}
              </Chip>
              {familyPlatforms.map((p) => (
                <Chip
                  key={p.slug}
                  active={filters.platform === p.slug}
                  onClick={() => update({ platform: filters.platform === p.slug ? "" : p.slug })}
                  count={matches.platformCounts.get(p.slug)}
                >
                  {p.name}
                </Chip>
              ))}
            </FilterRow>
          )}

          <FilterRow label="Port type">
            {portTypeList.map((t) => {
              const active = filters.types.includes(t.slug);
              return (
                <Chip
                  key={t.slug}
                  active={active}
                  title={t.blurb}
                  count={matches.typeCounts.get(t.slug) ?? 0}
                  onClick={() =>
                    update({
                      types: active ? filters.types.filter((x) => x !== t.slug) : [...filters.types, t.slug],
                    })
                  }
                >
                  {t.plural}
                </Chip>
              );
            })}
          </FilterRow>

          <div className="flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Toggle checked={filters.release} onChange={(v) => update({ release: v })}>
                Has a release download
              </Toggle>
              <Toggle checked={filters.multiplayer} onChange={(v) => update({ multiplayer: v })}>
                Multiplayer
              </Toggle>
              <Toggle checked={filters.browser} onChange={(v) => update({ browser: v })}>
                Playable in browser
              </Toggle>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Sort
              </label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as Sort })}
                className="h-9 rounded-md border border-line bg-bg-elevated px-2 text-sm text-ink outline-none focus:border-accent"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-wider text-muted" aria-live="polite">
          <span className="text-ink">{matches.results.length}</span>{" "}
          {matches.results.length === 1 ? "game" : "games"}
          {filters.q && (
            <>
              {" "}
              for “<span className="text-ink normal-case">{filters.q}</span>”
            </>
          )}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => update({ ...EMPTY, sort: filters.sort })}
            className="font-mono text-xs uppercase tracking-wider text-accent-ink hover:underline"
          >
            Reset filters ({activeCount})
          </button>
        )}
      </div>

      {matches.results.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {matches.results.slice(0, visible).map((g, i) => (
            <li key={g.slug} className="flex">
              <GameCard game={g} priority={i < 5} />
            </li>
          ))}
        </ul>
      )}

      {matches.results.length > visible && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex h-11 items-center rounded-md border border-line-strong bg-surface px-6 text-sm font-medium text-ink transition hover:border-ink"
          >
            Show more games
          </button>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Showing {visible} of {matches.results.length}
          </p>
        </div>
      )}

      {matches.results.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-line-strong bg-surface p-10 text-center">
          <p className="font-pixel text-xl text-ink">No ports found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Try a shorter search or remove a filter. Know a port we are missing? Suggest it on GitHub and it can be
            added to the catalog.
          </p>
          <button
            type="button"
            onClick={() => update(EMPTY)}
            className="mt-5 rounded-md border border-line bg-bg-elevated px-4 py-2 text-sm text-ink hover:border-line-strong"
          >
            Show all games
          </button>
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <span className="w-24 shrink-0 pt-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  count,
  dot,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  dot?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm transition ${
        active
          ? "border-ink bg-ink text-bg"
          : "border-line bg-bg-elevated text-ink-soft hover:border-line-strong hover:text-ink"
      }`}
    >
      {dot && <span aria-hidden="true" className="inline-block size-2" style={{ background: dot }} />}
      {children}
      {count !== undefined && (
        <span className={`font-mono text-[11px] ${active ? "text-bg/70" : "text-muted"}`}>{count}</span>
      )}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink-soft hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded-sm border-line accent-[var(--accent)]"
      />
      {children}
    </label>
  );
}
