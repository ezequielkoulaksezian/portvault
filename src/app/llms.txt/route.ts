import { site } from "@/config/site";
import { catalog, byPopularity, games, platformsInUse, portTypeList, stats } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const top = [...games].sort(byPopularity).slice(0, 40);
  const body = `# ${site.name}

> ${site.description}

${site.name} lists ${stats.games} classic games with ${stats.ports} unofficial native ports across ${stats.platforms} original platforms. Every game page names the recommended port, its type, latest release, license and official links, and answers common questions. Ports require files from the player's own copy of the game; ${site.name} never links to ROMs or ISOs. Catalog updated ${catalog.generatedAt.slice(0, 10)}.

## Key pages

- [Catalog with live search](${absoluteUrl("/")}): every game, filterable by platform, port type and features
- [Platforms](${absoluteUrl("/platforms")}): games grouped by original system
- [FAQ](${absoluteUrl("/faq")}): what ports are, legality, decompilation vs recompilation
- [About and methodology](${absoluteUrl("/about")}): inclusion criteria and data sources
- [Full catalog as Markdown](${absoluteUrl("/llms-full.txt")}): every game and port in one file

## Port types

${portTypeList.map((t) => `- [${t.plural}](${absoluteUrl(`/types/${t.slug}`)}): ${t.blurb}`).join("\n")}

## Platforms

${platformsInUse()
  .sort((a, b) => b.count - a.count)
  .map((p) => `- [${p.name}](${absoluteUrl(`/platforms/${p.slug}`)}): ${p.count} games`)
  .join("\n")}

## Most popular games

${top.map((g) => `- [${g.title}](${absoluteUrl(`/games/${g.slug}`)}): recommended port ${g.ports[0].name}`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
