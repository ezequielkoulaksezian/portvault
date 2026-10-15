import type { Metadata } from "next";
import Link from "next/link";
import { families, gamesForPlatform, platformsInUse, stats } from "@/lib/catalog";
import { plural } from "@/lib/format";
import { familyColor } from "@/components/badges";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GameCover } from "@/components/game-cover";

export const metadata: Metadata = {
  title: "PC ports by platform",
  description: `Native PC ports of classic games grouped by original platform: Nintendo 64, PlayStation, Xbox 360, GameCube, SNES, MS-DOS and more. ${stats.games} games across ${stats.platforms} platforms.`,
  alternates: { canonical: "/platforms" },
};

export default function PlatformsPage() {
  const platforms = platformsInUse();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Platforms", path: "/platforms" }]} />
      <h1 className="mt-4 font-pixel text-4xl text-ink sm:text-5xl">Ports by platform</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Every game in PortVault is filed under the platform it originally shipped on. Pick a system to see every
        classic from it that runs natively on PC today.
      </p>

      <div className="mt-10 space-y-10">
        {families.map((family) => {
          const items = platforms.filter((p) => p.family === family).sort((a, b) => b.count - a.count);
          if (!items.length) return null;
          return (
            <section key={family} aria-labelledby={`fam-${family}`}>
              <h2 id={`fam-${family}`} className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                <span className="inline-block size-2.5" style={{ background: familyColor(family) }} aria-hidden="true" />
                {family}
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => {
                  const top = gamesForPlatform(p.slug).slice(0, 3);
                  return (
                    <li key={p.slug}>
                      <Link
                        href={`/platforms/${p.slug}`}
                        className="group flex items-center gap-4 rounded-md border border-line bg-surface p-3 transition hover:border-line-strong"
                      >
                        <div className="flex shrink-0 -space-x-6">
                          {top.map((g) => (
                            <div key={g.slug} className="w-12 overflow-hidden rounded-sm border border-line">
                              <GameCover title={g.title} platform={g.platform} cover={g.cover?.url ?? null} sizes="48px" />
                            </div>
                          ))}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink group-hover:text-accent-ink">{p.name}</p>
                          <p className="text-sm text-muted">{plural(p.count, "game")}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
