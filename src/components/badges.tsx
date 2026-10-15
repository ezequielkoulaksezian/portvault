import { getPlatform, portTypes, type PortType } from "@/lib/meta";

const familyVar: Record<string, string> = {
  Nintendo: "var(--fam-nintendo)",
  PlayStation: "var(--fam-playstation)",
  Xbox: "var(--fam-xbox)",
  Sega: "var(--fam-sega)",
  Arcade: "var(--fam-arcade)",
  Computers: "var(--fam-computers)",
  Mobile: "var(--fam-mobile)",
};

export function familyColor(family: string): string {
  return familyVar[family] ?? "var(--fam-computers)";
}

export function PlatformBadge({ slug, full = false }: { slug: string; full?: boolean }) {
  const platform = getPlatform(slug);
  if (!platform) return null;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
      <span
        aria-hidden="true"
        className="inline-block size-2"
        style={{ background: familyColor(platform.family) }}
      />
      {full ? platform.name : platform.short}
    </span>
  );
}

export function TypeBadge({ type, size = "sm" }: { type: PortType; size?: "sm" | "md" }) {
  const meta = portTypes[type];
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-line bg-surface-muted font-mono uppercase tracking-wider text-ink-soft ${
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"
      }`}
      title={meta.blurb}
    >
      {meta.short}
    </span>
  );
}

export function RecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-white dark:text-bg">
      <svg viewBox="0 0 8 8" width="8" height="8" aria-hidden="true" fill="currentColor" shapeRendering="crispEdges">
        <path d="M3 0h2v2h2v2H5v1h1v3H5V7H3v1H2V5h1V4H1V2h2V0z" />
      </svg>
      Recommended
    </span>
  );
}
