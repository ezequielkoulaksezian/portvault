import Link from "next/link";
import type { GameIndexEntry } from "@/lib/meta";
import { AccessBadge, PlatformBadge, TypeBadge } from "@/components/badges";
import { GameCover } from "@/components/game-cover";

type Props = { game: GameIndexEntry; priority?: boolean; variant?: "native" | "web" };

/**
 * The whole card links to the game page; in the "web" variant a Play button on top of it opens the
 * browser version directly in a new tab.
 */
export function GameCard({ game, priority, variant = "native" }: Props) {
  const web = variant === "web";
  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-md border border-line bg-surface shadow-card transition duration-150 focus-within:-translate-y-0.5 hover:-translate-y-0.5 hover:border-line-strong">
      <div className="relative">
        <GameCover title={game.title} platform={game.platform} cover={game.cover} priority={priority} />
        {web && (
          <div className="absolute left-2 top-2 z-10">
            <AccessBadge free={game.webFree} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-line p-3">
        <div className="flex items-center justify-between gap-2">
          <PlatformBadge slug={game.platform} />
          {game.year && <span className="font-mono text-[11px] text-muted">{game.year}</span>}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-accent-ink">
          <Link href={`/games/${game.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {game.title}
          </Link>
        </h3>
        {web ? (
          <>
            <p className="line-clamp-1 text-xs text-muted">
              {game.playName}
              {game.webCount > 1 && <span> +{game.webCount - 1} more</span>}
            </p>
            <a
              href={game.playUrl!}
              target="_blank"
              rel="noopener"
              className="relative z-10 mt-auto inline-flex h-9 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-bg transition hover:opacity-90"
              aria-label={`Play ${game.title} in your browser with ${game.playName}`}
            >
              <PlayIcon />
              Play
            </a>
          </>
        ) : (
          <>
            <p className="line-clamp-1 text-xs text-muted">
              {game.topPort}
              {game.portCount > 1 && <span> +{game.portCount - 1} more</span>}
            </p>
            <div className="mt-auto flex flex-wrap gap-1 pt-1">
              {game.types.slice(0, 2).map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
              {game.webCount > 0 && <AccessBadge free={game.webFree} compact />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PlayIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} aria-hidden="true" fill="currentColor" shapeRendering="crispEdges">
      <path d="M1 0h2v1h1v1h1v1h1v2H5v1H4v1H3v1H1V0z" />
    </svg>
  );
}
