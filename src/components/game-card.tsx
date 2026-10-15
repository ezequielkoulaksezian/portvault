import Link from "next/link";
import type { GameIndexEntry } from "@/lib/meta";
import { PlatformBadge, TypeBadge } from "@/components/badges";
import { GameCover } from "@/components/game-cover";

export function GameCard({ game, priority }: { game: GameIndexEntry; priority?: boolean }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-md border border-line bg-surface shadow-card transition duration-150 hover:-translate-y-0.5 hover:border-line-strong focus-visible:-translate-y-0.5"
    >
      <GameCover title={game.title} platform={game.platform} cover={game.cover} priority={priority} />
      <div className="flex flex-1 flex-col gap-2 border-t border-line p-3">
        <div className="flex items-center justify-between gap-2">
          <PlatformBadge slug={game.platform} />
          {game.year && <span className="font-mono text-[11px] text-muted">{game.year}</span>}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-accent-ink">
          {game.title}
        </h3>
        <p className="line-clamp-1 text-xs text-muted">
          {game.topPort}
          {game.portCount > 1 && <span> +{game.portCount - 1} more</span>}
        </p>
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {game.types.slice(0, 2).map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>
    </Link>
  );
}
