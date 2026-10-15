import Link from "next/link";
import { site, hasDonations } from "@/config/site";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/#play", label: "Play online" },
  { href: "/pc-ports", label: "PC ports" },
  { href: "/platforms", label: "Platforms" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
          <LogoMark />
          <span className="font-pixel text-lg tracking-wide text-ink">{site.name}</span>
        </Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-surface-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-xs font-medium text-ink-soft transition hover:border-line-strong hover:text-ink sm:inline-flex"
          >
            <GitHubIcon />
            <span>Source</span>
          </a>
          <Link
            href="/donate"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-semibold text-white transition hover:brightness-110 dark:text-bg"
          >
            <HeartIcon />
            <span>{hasDonations ? "Donate" : "Support"}</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <nav aria-label="Mobile" className="flex gap-1 overflow-x-auto border-t border-line px-3 py-1.5 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-md px-3 py-1.5 text-sm text-ink-soft hover:bg-surface-muted hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor" shapeRendering="crispEdges">
      <path d="M3 3h3v1h1v1h2V4h1V3h3v1h1v4h-1v1h-1v1h-1v1h-1v1H9v1H7v-1H6v-1H5v-1H4V9H3V8H2V4h1V3z" />
    </svg>
  );
}
