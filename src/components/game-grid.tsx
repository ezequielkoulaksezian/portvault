import { indexEntry, type Game } from "@/lib/catalog";
import { GameCard } from "@/components/game-card";

export function GameGrid({ games }: { games: Game[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {games.map((g, i) => (
        <li key={g.slug} className="flex">
          <GameCard game={indexEntry(g)} priority={i < 5} />
        </li>
      ))}
    </ul>
  );
}
