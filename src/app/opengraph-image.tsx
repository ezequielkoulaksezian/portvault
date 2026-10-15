import { site } from "@/config/site";
import { stats } from "@/lib/catalog";
import { ogImage, ogSize } from "@/lib/og";

export const alt = `${site.name}: ${site.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    kicker: `${stats.webGames} games · ${stats.webFree} free right now`,
    title: "Play classic games in your browser.",
    footer: "Doom · Quake · Diablo · Duke Nukem 3D · Cave Story · Halo",
  });
}
