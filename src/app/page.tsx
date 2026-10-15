import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { byFeatured, catalog, portTypeList, searchIndex, stats, webGames } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { faqJsonLd, itemListJsonLd } from "@/lib/seo";
import { GameBrowser } from "@/components/game-browser";
import { JsonLd } from "@/components/json-ld";
import { PlayIcon } from "@/components/game-card";
import { siteFaqs } from "@/app/faq/faqs";

export const metadata: Metadata = {
  title: { absolute: `Play classic games in your browser · ${site.name}` },
  description: `Play ${stats.webGames} classic games in your browser, ${stats.webFree} of them free right now: Doom, Quake, Diablo, Duke Nukem 3D, Cave Story, Halo and more. Hand-checked WebAssembly ports, no install, no piracy.`,
  alternates: { canonical: "/" },
};

const steps = [
  { title: "Pick a game", text: "Every game links to a port that runs inside the browser, checked by hand." },
  { title: "Press Play", text: "The port opens in a new tab. No installs, no plugins, no accounts." },
  { title: "Free or your files", text: "Free games start right away; others ask for files from your own copy." },
];

export default function HomePage() {
  const entries = searchIndex(webGames);
  const featured = [...webGames].sort(byFeatured);
  const homeFaqs = siteFaqs.slice(0, 4);

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent-ink">
              <span className="mr-2 inline-block size-2 animate-pulse bg-phosphor align-middle" aria-hidden="true" />
              Press start · {stats.webGames} games · {stats.webFree} free right now
            </p>
            <h1 className="mt-4 font-pixel text-4xl leading-[1.05] text-ink text-balance sm:text-6xl">
              Play classic games in your browser.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Doom, Quake, Diablo, Duke Nukem 3D, Cave Story, Halo and more, running natively in a browser tab
              through WebAssembly ports of their original engines. Every link is checked by hand and legal: free
              shareware, demos and freeware, or ports that use the files from your own copy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#play"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-bg transition hover:opacity-90"
              >
                <PlayIcon />
                Browse games to play
              </a>
              <Link
                href="/pc-ports"
                className="inline-flex h-11 items-center rounded-md border border-line-strong bg-surface px-5 text-sm font-medium text-ink transition hover:border-ink"
              >
                Native PC ports
              </Link>
            </div>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3 lg:grid-cols-1">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4 bg-surface p-4">
                <span className="font-pixel text-2xl text-accent-ink">{i + 1}</span>
                <div>
                  <p className="font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="play" aria-labelledby="play-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-12 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="play-heading" className="font-pixel text-3xl text-ink">
              Play online
            </h2>
            <p className="mt-1 text-sm text-muted">
              {stats.webPorts} browser ports for {stats.webGames} games · updated {formatDate(catalog.generatedAt)}
            </p>
          </div>
          <p className="text-sm text-muted">Filters apply instantly. Press / to search.</p>
        </div>
        <GameBrowser entries={entries} mode="web" />
      </section>

      <section aria-labelledby="legal-heading" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 rounded-lg border border-line bg-surface p-6 sm:p-8 md:grid-cols-3">
          <div>
            <h2 id="legal-heading" className="font-pixel text-2xl text-ink">
              Only legal sources
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sites that stream full commercial games without permission are left out on purpose.
            </p>
          </div>
          <div className="rounded-md border border-line bg-bg-elevated p-4">
            <span className="inline-flex rounded-sm bg-phosphor px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-black">
              Free
            </span>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Starts instantly with data that may be shared legally: shareware episodes, official demos, freeware and
              open-source games.
            </p>
          </div>
          <div className="rounded-md border border-line bg-bg-elevated p-4">
            <span className="inline-flex rounded-sm bg-surface px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-ink ring-1 ring-line-strong">
              Your files
            </span>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              The engine runs in your browser and you load the game files from a copy you own, such as a disc image or
              the original data folder.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="native-heading" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="native-heading" className="font-pixel text-2xl text-ink">
              Prefer to install? {stats.nativeGames} games have native PC ports
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Decompilations and recompilations run classics natively on Windows, Linux, macOS and Steam Deck, with
              widescreen, high frame rates and mods.
            </p>
          </div>
          <Link href="/pc-ports" className="text-sm font-medium text-accent-ink hover:underline">
            Browse {stats.ports} PC ports →
          </Link>
        </div>
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
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 rounded-lg border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="faq-heading" className="font-pixel text-2xl text-ink">
              Quick answers
            </h2>
            <p className="mt-2 text-sm text-muted">Playing classics in the browser, explained.</p>
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

      <JsonLd data={itemListJsonLd("Classic games you can play in your browser", featured)} />
      <JsonLd data={faqJsonLd(homeFaqs)} />
    </>
  );
}
