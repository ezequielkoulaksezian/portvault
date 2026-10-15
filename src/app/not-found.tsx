import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink">Error 404</p>
      <h1 className="mt-4 font-pixel text-5xl text-ink">Game over</h1>
      <p className="mt-4 text-ink-soft">This page doesn&apos;t exist, or the game you were looking for isn&apos;t in the catalog yet.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-semibold text-bg">
          Continue? Yes
        </Link>
        <Link href="/#catalog" className="inline-flex h-10 items-center rounded-md border border-line bg-surface px-4 text-sm text-ink">
          Search the catalog
        </Link>
      </div>
    </div>
  );
}
