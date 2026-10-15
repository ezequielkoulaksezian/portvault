import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { games, getGame, getPlatform, indexEntry, portTypes, relatedGames, type Game, type Port } from "@/lib/catalog";
import { formatDate, formatMonth, formatStars, listToText, plural } from "@/lib/format";
import { faqJsonLd, gameFaqs, gameJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GameCard } from "@/components/game-card";
import { GameCover } from "@/components/game-cover";
import { JsonLd } from "@/components/json-ld";
import { PlatformBadge, RecommendedBadge, TypeBadge } from "@/components/badges";
import { GitHubIcon } from "@/components/site-header";

export const dynamicParams = false;

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

function describe(game: Game): string {
  const context = [game.year, getPlatform(game.platform)?.name].filter(Boolean).join(", ");
  const names = listToText(game.ports.slice(0, 3).map((p) => p.name));
  return `${game.title}${context ? ` (${context})` : ""} on PC: ${plural(game.ports.length, "native port")} including ${names}. Downloads, source code, status and how to play with your own copy.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  const title = `${game.title} PC port${game.ports.length > 1 ? "s" : ""}`;
  const description = describe(game);
  return {
    title,
    description,
    keywords: [
      `${game.title} pc port`,
      `${game.title} pc`,
      `${game.title} recomp`,
      `${game.title} decompilation`,
      ...game.ports.map((p) => p.name),
    ],
    alternates: { canonical: `/games/${game.slug}` },
    openGraph: {
      type: "article",
      title: `${title} · ${site.name}`,
      description,
      url: `/games/${game.slug}`,
    },
    twitter: { card: "summary_large_image", title: `${title} · ${site.name}`, description },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const platform = getPlatform(game.platform);
  const faqs = gameFaqs(game);
  const related = relatedGames(game);
  const best = game.ports[0];

  const facts: [string, React.ReactNode][] = [
    [
      "Original platform",
      platform ? (
        <Link href={`/platforms/${platform.slug}`} className="hover:text-accent-ink">
          {platform.name}
        </Link>
      ) : (
        "—"
      ),
    ],
    ["Released", game.year ?? "—"],
    ["Developer", game.developers.length ? game.developers.join(", ") : "—"],
    ["Publisher", game.publishers.length ? game.publishers.join(", ") : "—"],
    ["Genre", game.genres.length ? game.genres.slice(0, 3).join(", ") : "—"],
    ["Ports", plural(game.ports.length, "port")],
    ["Last port update", formatDate(game.lastUpdate) ?? "—"],
  ];

  return (
    <article className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Breadcrumbs
        items={[
          ...(platform ? [{ name: platform.name, path: `/platforms/${platform.slug}` }] : []),
          { name: game.title, path: `/games/${game.slug}` },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-x-12">
        <aside className="order-2 lg:sticky lg:top-24 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="pixel-frame mx-auto max-w-[300px] overflow-hidden rounded-md">
            <GameCover
              title={game.title}
              platform={game.platform}
              cover={game.cover?.url ?? null}
              priority
              sizes="300px"
            />
          </div>
          {game.cover && (
            <p className="mx-auto mt-2 max-w-[300px] text-[11px] leading-snug text-muted">
              Cover art via{" "}
              <a
                href={game.cover.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-ink"
              >
                {game.cover.source}
              </a>
              . Used for identification; rights belong to the publisher.
            </p>
          )}
          <dl className="mx-auto mt-5 max-w-[300px] divide-y divide-line rounded-md border border-line bg-surface text-sm">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-3 py-2.5">
                <dt className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted">{label}</dt>
                <dd className="text-right text-ink-soft">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <header className="order-1 min-w-0 lg:order-none lg:col-start-2 lg:row-start-1">
          <div className="flex flex-wrap items-center gap-3">
            <PlatformBadge slug={game.platform} full />
            {game.types.map((t) => (
              <TypeBadge key={t} type={t} size="md" />
            ))}
          </div>
          <h1 className="mt-3 font-pixel text-3xl leading-tight text-ink text-balance sm:text-5xl">{game.title}</h1>
          {game.aka.length > 0 && <p className="mt-2 text-sm text-muted">Also known as {listToText(game.aka)}</p>}
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">
              {game.title} has {plural(game.ports.length, "native PC port")}.
            </strong>{" "}
            The {best.recommended ? "recommended" : "most established"} one is{" "}
            <a href={`#${best.id}`} className="font-medium text-accent-ink underline underline-offset-4">
              {best.name}
            </a>
            , a {portTypes[best.type].name.toLowerCase()}
            {best.release ? ` (latest release ${best.release})` : ""}. You need files from your own copy of the game to
            play.
          </p>
        </header>

        <div className="order-3 min-w-0 lg:order-none lg:col-start-2 lg:row-start-2">
          {game.summary && (
            <section aria-labelledby="about-heading" className="mt-8 max-w-3xl">
              <h2 id="about-heading" className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                About the game
              </h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{game.summary}</p>
              {game.wikipedia && (
                <p className="mt-2 text-xs text-muted">
                  Source:{" "}
                  <a
                    href={game.wikipedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    Wikipedia, “{game.wikipedia.title}”
                  </a>{" "}
                  (CC BY-SA 4.0)
                </p>
              )}
            </section>
          )}

          <section aria-labelledby="ports-heading" className="mt-10">
            <h2 id="ports-heading" className="font-pixel text-2xl text-ink">
              Available ports
            </h2>
            <ol className="mt-4 space-y-4">
              {game.ports.map((port) => (
                <li key={port.id}>
                  <PortCard port={port} />
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-md border border-dashed border-line-strong bg-bg-elevated p-4 text-sm leading-relaxed text-ink-soft">
              <strong className="text-ink">Before you start:</strong> these projects do not include the game. Each one
              asks for a ROM, disc image or game files from a copy you own on first launch. PortVault never links to
              ROMs or ISOs. Download ports only from their official project pages linked here.
            </div>
          </section>

          <section aria-labelledby="faq-heading" className="mt-12">
            <h2 id="faq-heading" className="font-pixel text-2xl text-ink">
              Quick answers
            </h2>
            <dl className="mt-4 divide-y divide-line rounded-md border border-line bg-surface">
              {faqs.map((f) => (
                <div key={f.question} className="p-4">
                  <dt className="font-semibold text-ink">{f.question}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="mt-6 text-sm text-muted">
            Something wrong or missing for {game.title}?{" "}
            <a
              href={`${site.repo}/issues/new?template=port-report.yml&title=${encodeURIComponent(`[${game.title}] `)}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent-ink underline underline-offset-2"
            >
              Report it on GitHub
            </a>
            .
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16">
          <div className="flex items-end justify-between gap-3">
            <h2 id="related-heading" className="font-pixel text-2xl text-ink">
              More {platform?.name} ports
            </h2>
            {platform && (
              <Link href={`/platforms/${platform.slug}`} className="text-sm text-accent-ink hover:underline">
                See all →
              </Link>
            )}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {related.map((g) => (
              <li key={g.slug} className="flex">
                <GameCard game={indexEntry(g)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd data={gameJsonLd(game)} />
      <JsonLd data={faqJsonLd(faqs)} />
    </article>
  );
}

function PortCard({ port }: { port: Port }) {
  const type = portTypes[port.type];
  const links: { href: string; label: string; primary?: boolean; icon?: React.ReactNode }[] = [];
  if (port.releaseUrl) links.push({ href: port.releaseUrl, label: `Download ${port.release}`, primary: true });
  if (port.playUrl) links.push({ href: port.playUrl, label: "Play in browser", primary: !port.releaseUrl });
  if (port.repo) links.push({ href: port.url, label: "Source code", icon: <GitHubIcon size={14} /> });
  else links.push({ href: port.url, label: "Project page", primary: links.length === 0 });
  if (port.homepage && port.homepage !== port.url) links.push({ href: port.homepage, label: "Website" });
  if (port.video) links.push({ href: port.video, label: "Video" });

  return (
    <div id={port.id} className="scroll-mt-28 rounded-md border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-ink">{port.name}</h3>
            {port.recommended && <RecommendedBadge />}
            {port.archived && (
              <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                Archived
              </span>
            )}
          </div>
          {port.repo && <p className="mt-0.5 font-mono text-xs text-muted">{port.repo}</p>}
        </div>
        <TypeBadge type={port.type} size="md" />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{port.description ?? type.blurb}</p>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-muted">
        {port.stars > 0 && (
          <div className="flex gap-1.5">
            <dt>Stars</dt>
            <dd className="text-ink">{formatStars(port.stars)}</dd>
          </div>
        )}
        {port.release && (
          <div className="flex gap-1.5">
            <dt>Release</dt>
            <dd className="text-ink normal-case">
              {port.release}
              {port.releaseDate ? ` · ${formatMonth(port.releaseDate)}` : ""}
            </dd>
          </div>
        )}
        {port.lastCommit && (
          <div className="flex gap-1.5">
            <dt>Last commit</dt>
            <dd className="text-ink">{formatMonth(port.lastCommit)}</dd>
          </div>
        )}
        {port.license && (
          <div className="flex gap-1.5">
            <dt>License</dt>
            <dd className="text-ink">{port.license}</dd>
          </div>
        )}
        {port.multiplayer && (
          <div>
            <dd className="text-phosphor">Multiplayer</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition ${
              l.primary
                ? "bg-ink text-bg hover:opacity-90"
                : "border border-line bg-bg-elevated text-ink-soft hover:border-line-strong hover:text-ink"
            }`}
          >
            {l.icon}
            {l.label}
            <span aria-hidden="true" className="text-xs opacity-60">
              ↗
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
