import Image from "next/image";
import { getPlatform } from "@/lib/meta";
import { familyColor } from "@/components/badges";

type Props = {
  title: string;
  platform: string;
  cover: string | null;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Box art inside a cartridge-style frame. Covers keep their own aspect ratio (box art differs
 * between platforms), centered on a dark backdrop. Games without art get a generated label.
 */
export function GameCover({ title, platform, cover, priority, sizes = "(min-width: 1024px) 220px, 45vw", className = "" }: Props) {
  const p = getPlatform(platform);
  return (
    <div className={`relative aspect-[3/4] overflow-hidden bg-cover-bg ${className}`}>
      {cover ? (
        <Image
          src={cover}
          alt={`${title} cover art`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-contain p-2"
        />
      ) : (
        <Placeholder title={title} label={p?.short ?? ""} color={familyColor(p?.family ?? "")} />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.035)_0_1px,transparent_1px_3px)]"
      />
    </div>
  );
}

function Placeholder({ title, label, color }: { title: string; label: string; color: string }) {
  return (
    <div className="absolute inset-0 flex flex-col p-3">
      <div className="h-1.5 w-full" style={{ background: color }} />
      <div className="mt-3 flex flex-1 flex-col justify-center rounded-sm border border-white/10 bg-white/[0.03] px-3">
        <span className="font-pixel text-[10px] uppercase tracking-[0.25em] text-white/40">{label}</span>
        <span className="mt-2 line-clamp-4 font-pixel text-lg leading-tight text-white/85">{title}</span>
      </div>
      <div className="mt-3 flex justify-between">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="h-2 w-1.5 bg-white/15" />
        ))}
      </div>
    </div>
  );
}
