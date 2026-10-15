import { site } from "@/config/site";
import { catalog, games, getPlatform, portTypes } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const sections = games.map((g) => {
    const platform = getPlatform(g.platform)?.name ?? g.platform;
    const facts = [
      `Original platform: ${platform}`,
      g.year ? `Released: ${g.year}` : null,
      g.developers.length ? `Developer: ${g.developers.join(", ")}` : null,
      g.genres.length ? `Genre: ${g.genres.slice(0, 3).join(", ")}` : null,
    ].filter(Boolean);
    const ports = g.ports.map((p) => {
      const bits = [
        portTypes[p.type].name,
        p.recommended ? "recommended" : null,
        p.release ? `latest release ${p.release}${p.releaseDate ? ` (${p.releaseDate.slice(0, 10)})` : ""}` : null,
        p.license ? `license ${p.license}` : null,
      ].filter(Boolean);
      return `- **${p.name}** (${bits.join(", ")}): ${p.url}${p.description ? `\n  ${p.description}` : ""}`;
    });
    return `## ${g.title}

URL: ${absoluteUrl(`/games/${g.slug}`)}
${facts.join(" · ")}

${ports.join("\n")}`;
  });

  const body = `# ${site.name}: full catalog

> ${site.description}

Generated ${catalog.generatedAt}. All ports need files from the player's own copy of the game.

${sections.join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
