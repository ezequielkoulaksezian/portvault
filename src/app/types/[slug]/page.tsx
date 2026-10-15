import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gamesForType, portTypeList, portTypes, type PortType } from "@/lib/catalog";
import { plural } from "@/lib/format";
import { itemListJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GameGrid } from "@/components/game-grid";
import { JsonLd } from "@/components/json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return portTypeList.map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const type = portTypes[slug as PortType];
  if (!type) return {};
  const list = gamesForType(type.slug);
  return {
    title: `${type.plural}: what they are and every game that has one`,
    description: `${type.blurb} ${plural(list.length, "classic game")} with ${type.plural.toLowerCase()} you can play on PC today.`,
    alternates: { canonical: `/types/${slug}` },
  };
}

export default async function TypePage({ params }: Props) {
  const { slug } = await params;
  const type = portTypes[slug as PortType];
  if (!type) notFound();
  const list = gamesForType(type.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Breadcrumbs items={[{ name: type.plural, path: `/types/${slug}` }]} />
      <h1 className="mt-4 font-pixel text-4xl text-ink sm:text-5xl">{type.plural}</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="max-w-3xl">
          <p className="text-lg font-medium leading-relaxed text-ink">{type.blurb}</p>
          <p className="mt-3 leading-relaxed text-ink-soft">{type.explainer}</p>
        </div>
        <nav aria-label="Other port types" className="rounded-md border border-line bg-surface p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Other port types</p>
          <ul className="mt-2 space-y-1.5">
            {portTypeList
              .filter((t) => t.slug !== type.slug)
              .map((t) => (
                <li key={t.slug}>
                  <Link href={`/types/${t.slug}`} className="text-sm text-ink-soft hover:text-accent-ink">
                    {t.plural} →
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
      <h2 className="mt-12 font-pixel text-2xl text-ink">
        {plural(list.length, "game")} with {type.plural.toLowerCase()}
      </h2>
      <div className="mt-5">
        <GameGrid games={list} />
      </div>
      <JsonLd data={itemListJsonLd(`Games with ${type.plural.toLowerCase()}`, list)} />
    </div>
  );
}
