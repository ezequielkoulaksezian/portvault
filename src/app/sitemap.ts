import type { MetadataRoute } from "next";
import { catalog, games, platformsInUse, portTypeList } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date(catalog.generatedAt);
  return [
    { url: absoluteUrl("/"), lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/pc-ports"), lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/platforms"), lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/faq"), lastModified: updated, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/about"), lastModified: updated, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/donate"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.1 },
    ...platformsInUse().map((p) => ({
      url: absoluteUrl(`/platforms/${p.slug}`),
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...portTypeList.map((t) => ({
      url: absoluteUrl(`/types/${t.slug}`),
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...games.map((g) => ({
      url: absoluteUrl(`/games/${g.slug}`),
      lastModified: g.lastUpdate ? new Date(g.lastUpdate) : updated,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      ...(g.cover ? { images: [g.cover.url] } : {}),
    })),
  ];
}
