import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { catalog, games, portTypeList, searchIndex, stats } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { faqJsonLd, itemListJsonLd } from "@/lib/seo";
import { GameBrowser } from "@/components/game-browser";
import { JsonLd } from "@/components/json-ld";
import { siteFaqs } from "@/app/faq/faqs";

export const metadata: Metadata = {
  title: { absolute: `${site.name} · Every native PC port of classic games, in one place` },
  description: `Browse ${stats.games} classic games with ${stats.ports} unofficial native PC ports: decompilations, static recompilations (N64Recomp, XenonRecomp), source ports and engine remakes, with links to every project.`,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const entries = searchIndex();
  const homeFaqs = siteFaqs.slice(0, 4);
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent-ink">
            <span className="mr-2 inline-block size-2 animate-pulse bg-phosphor align-middle" aria-hidden="true" />
            Insert coin · {stats.games} games · {stats.ports} ports
          </p>
          <h1 className="mt-4 max-w-4xl font-pixel text-4xl leading-[1.05] text-ink text-balance sm:text-6xl">
            Classic games, running natively on modern machines.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            PortVault is an open-source catalog of unofficial PC ports: decompilations, static recompilations,
            source ports and engine remakes. Find the best way to play each classic on your PC, with widescreen,
            high frame rates and mods, and go straight to the project.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#catalog"
              className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-bg transition hover:opacity-90"
            >
              Browse the catalog
            </a>
            <Link
              href="/about"
              className="inline-flex h-11 items-center rounded-md border border-line-strong bg-surface px-5 text-sm font-medium text-ink transition hover:border-ink"
            >
              How ports work
            </Link>
          </div>
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
            {[
              ["Games", stats.games],
              ["Ports", stats.ports],
              ["Platforms", stats.platforms],
              ["Updated", formatDate(catalog.generatedAt)],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface px-4 py-3">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</dt>
                <dd className="mt-1 font-mono text-xl font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="types-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 id="types-heading" className="font-pixel text-2xl text-ink">
          Four ways to bring a game to PC
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {portTypeList.map((t, i) => (
            <li key={t.slug}>
              <Link
                href={`/types/${t.slug}`}
                className="group flex h-full flex-col rounded-md border border-line bg-surface p-4 transition hover:border-line-strong"
              >
                <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
                <span className="mt-2 font-semibold text-ink group-hover:text-accent-ink">{t.plural}</span>
                <span className="mt-1.5 text-sm leading-relaxed text-muted">{t.blurb}</span>
                <span className="mt-auto pt-3 font-mono text-[11px] uppercase tracking-wider text-accent-ink">
                  {games.filter((g) => g.types.includes(t.slug)).length} games →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="catalog" aria-labelledby="catalog-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 id="catalog-heading" className="font-pixel text-2xl text-ink">
            The catalog
          </h2>
          <p className="text-sm text-muted">Filters apply instantly. Press / to search.</p>
        </div>
        <GameBrowser entries={entries} />
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 rounded-lg border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="faq-heading" className="font-pixel text-2xl text-ink">
              Quick answers
            </h2>
            <p className="mt-2 text-sm text-muted">The basics about unofficial ports.</p>
            <Link href="/faq" className="mt-4 inline-block text-sm font-medium text-accent-ink hover:underline">
              Read the full FAQ →
            </Link>
          </div>
          <dl className="divide-y divide-line">
            {homeFaqs.map((f) => (
              <div key={f.question} className="py-4 first:pt-0 last:pb-0">
                <dt className="font-semibold text-ink">{f.question}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <JsonLd data={itemListJsonLd(`${site.name} catalog`, games.slice(0, 100))} />
      <JsonLd data={faqJsonLd(homeFaqs)} />
    </>
  );
}
