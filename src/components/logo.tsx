export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden="true"
      shapeRendering="crispEdges"
      className="shrink-0"
    >
      <rect x="1" y="1" width="14" height="14" fill="var(--ink)" />
      <rect x="2" y="2" width="12" height="9" fill="var(--accent)" />
      <rect x="4" y="4" width="2" height="5" fill="var(--bg)" />
      <rect x="6" y="4" width="3" height="2" fill="var(--bg)" />
      <rect x="9" y="5" width="1" height="2" fill="var(--bg)" />
      <rect x="6" y="7" width="3" height="1" fill="var(--bg)" />
      <rect x="3" y="12" width="2" height="2" fill="var(--bg)" />
      <rect x="6" y="12" width="2" height="2" fill="var(--bg)" />
      <rect x="11" y="12" width="2" height="2" fill="var(--phosphor)" />
    </svg>
  );
}
