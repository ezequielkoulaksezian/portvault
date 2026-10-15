import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { catalog, nativeGames, portTypeList, searchIndex, stats } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { itemListJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GameBrowser } from "@/components/game-browser";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Native PC ports of classic games: decompilations and recompilations",
  description: `Browse ${stats.nativeGames} classic games with ${stats.ports} unofficial native PC ports: decompilations, static recompilations (N64Recomp, XenonRecomp), source ports and engine remakes, with links to every project.`,
  alternates: { canonical: "/pc-ports" },
};

export default function PcPortsPage() {
  const entries = searchIndex(nativeGames);
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6">
          <Breadcrumbs items={[{ name: "PC ports", path: "/pc-ports" }]} />
          <h1 className="mt-4 max-w-4xl font-pixel text-4xl leading-[1.05] text-ink text-balance sm:text-5xl">
            Native PC ports of classic games
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {stats.nativeGames} games with {stats.ports} community ports that run natively on Windows, Linux, macOS
            or Steam Deck: decompilations, static recompilations, source ports and engine remakes. Updated{" "}
            {formatDate(catalog.generatedAt)}.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {portTypeList.map((t, i) => (
              <li key={t.slug}>
                <Link
                  href={`/types/${t.slug}`}
                  className="group flex h-full flex-col rounded-md border border-line bg-surface p-4 transition hover:border-line-strong"
                >
                  <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
                  <span className="mt-2 font-semibold text-ink group-hover:text-accent-ink">{t.plural}</span>
                  <span className="mt-1.5 text-sm leading-relaxed text-muted">{t.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-label="Catalog" className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <GameBrowser entries={entries} mode="native" />
      </section>
      <JsonLd data={itemListJsonLd(`${site.name}: native PC ports`, nativeGames.slice(0, 100))} />
    </>
  );
}
