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
  const free = game.web.some((w) => w.access === "free");
  return ogImage({
    kicker: [platform?.name, game.year].filter(Boolean).join(" · "),
    title: game.web.length ? `Play ${game.title} in your browser` : `${game.title} on PC`,
    footer: game.web.length
      ? `${free ? "Free to play" : "Bring your own files"} · ${game.web[0].name}`
      : `${plural(game.ports.length, "native port")} · Recommended: ${game.ports[0].name}`,
  });
}
