import { site } from "@/config/site";
import { byFeatured, byPopularity, catalog, nativeGames, platformsInUse, portTypeList, stats, webGames } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const top = [...nativeGames].sort(byPopularity).slice(0, 40);
  const playable = [...webGames].sort(byFeatured);
  const body = `# ${site.name}

> ${site.description}

${site.name} lists ${stats.webGames} classic games you can play in a web browser (${stats.webFree} of them free, using legally free data such as shareware, official demos or freeware) and ${stats.nativeGames} games with ${stats.ports} unofficial native PC ports across ${stats.platforms} original platforms. Every browser port is checked by hand; sites that stream full commercial games without permission are excluded. Native ports require files from the player's own copy of the game; ${site.name} never links to ROMs or ISOs. Catalog updated ${catalog.generatedAt.slice(0, 10)}.

## Key pages

- [Play online](${absoluteUrl("/")}): every game playable in the browser, filterable by free or bring-your-own-files
- [Native PC ports](${absoluteUrl("/pc-ports")}): every game with a native port, filterable by platform, port type and features
- [Platforms](${absoluteUrl("/platforms")}): games grouped by original system
- [FAQ](${absoluteUrl("/faq")}): what ports are, legality, decompilation vs recompilation
- [About and methodology](${absoluteUrl("/about")}): inclusion criteria and data sources
- [Full catalog as Markdown](${absoluteUrl("/llms-full.txt")}): every game and port in one file

## Games you can play in the browser

${playable
  .map(
    (g) =>
      `- [${g.title}](${absoluteUrl(`/games/${g.slug}`)}): ${g.web
        .map((w) => `${w.name} (${w.access === "free" ? "free" : "needs your own files"}) ${w.url}`)
        .join("; ")}`,
  )
  .join("\n")}

## Port types

${portTypeList.map((t) => `- [${t.plural}](${absoluteUrl(`/types/${t.slug}`)}): ${t.blurb}`).join("\n")}

## Platforms

${platformsInUse()
  .sort((a, b) => b.count - a.count)
  .map((p) => `- [${p.name}](${absoluteUrl(`/platforms/${p.slug}`)}): ${p.count} games`)
  .join("\n")}

## Most popular native PC ports

${top.map((g) => `- [${g.title}](${absoluteUrl(`/games/${g.slug}`)}): recommended port ${g.ports[0].name}`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
