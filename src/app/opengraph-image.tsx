import { site } from "@/config/site";
import { stats } from "@/lib/catalog";
import { ogImage, ogSize } from "@/lib/og";

export const alt = `${site.name}: ${site.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    kicker: `${stats.games} games · ${stats.ports} ports`,
    title: "Classic games, running natively on modern machines.",
    footer: "Decompilations · Recompilations · Source ports · Engine remakes",
  });
}
