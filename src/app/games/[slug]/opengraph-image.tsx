import { games, getGame, getPlatform } from "@/lib/catalog";
import { plural } from "@/lib/format";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "PC ports of a classic game";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug)!;
  const platform = getPlatform(game.platform);
  return ogImage({
    kicker: [platform?.name, game.year].filter(Boolean).join(" · "),
    title: `${game.title} on PC`,
    footer: `${plural(game.ports.length, "native port")} · Recommended: ${game.ports[0].name}`,
  });
}
