import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gamesForPlatform, getPlatform, platformsInUse, portTypes, type PortType } from "@/lib/catalog";
import { listToText, plural } from "@/lib/format";
import { itemListJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GameGrid } from "@/components/game-grid";
import { JsonLd } from "@/components/json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return platformsInUse().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const platform = getPlatform(slug);
  if (!platform) return {};
  const list = gamesForPlatform(slug);
  const examples = listToText(list.slice(0, 3).map((g) => g.title));
  return {
    title: `${platform.name} games on PC: every native port`,
    description: `${plural(list.length, `${platform.name} game`)} you can play natively on PC through decompilations, recompilations and source ports, including ${examples}.`,
    alternates: { canonical: `/platforms/${slug}` },
  };
}

export default async function PlatformPage({ params }: Props) {
  const { slug } = await params;
  const platform = getPlatform(slug);
  if (!platform) notFound();
  const list = gamesForPlatform(slug);
  const typeCounts = Object.keys(portTypes)
    .map((t) => [t as PortType, list.filter((g) => g.types.includes(t as PortType)).length] as const)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "Platforms", path: "/platforms" },
          { name: platform.name, path: `/platforms/${slug}` },
        ]}
      />
      <h1 className="mt-4 font-pixel text-4xl text-ink text-balance sm:text-5xl">{platform.name} PC ports</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">
        {plural(list.length, `${platform.name} game`)} can be played natively on a modern PC.{" "}
        {typeCounts.length > 0 && (
          <>
            Most of them are{" "}
            {listToText(typeCounts.slice(0, 2).map(([t, n]) => `${portTypes[t].plural.toLowerCase()} (${n})`))}.
          </>
        )}{" "}
        Every port needs files from your own copy of the game.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/?platform=${slug}&family=${encodeURIComponent(platform.family)}#catalog`}
          className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-3 text-sm text-ink-soft hover:border-line-strong hover:text-ink"
        >
          Search and filter {platform.short} games →
        </Link>
      </div>
      <div className="mt-8">
        <GameGrid games={list} />
      </div>
      <JsonLd data={itemListJsonLd(`${platform.name} games with PC ports`, list)} />
    </div>
  );
}
