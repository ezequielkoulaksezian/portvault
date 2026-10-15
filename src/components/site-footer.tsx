import Link from "next/link";
import { site } from "@/config/site";
import { catalog, families, platformsInUse, portTypeList, stats } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { LogoMark } from "@/components/logo";

export function SiteFooter() {
  const platforms = platformsInUse();
  return (
    <footer className="mt-10 border-t border-line bg-bg-elevated">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="font-pixel text-base text-ink">{site.name}</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {stats.webGames} classic games you can play in your browser and {stats.ports} native PC ports of{" "}
            {stats.nativeGames} more. Open source and community maintained.
          </p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted">
            PortVault links to source code and project pages only. It never hosts or links to ROMs, ISOs or game
            assets. Game names and cover art belong to their respective owners.
          </p>
        </div>
        <FooterColumn title="Port types">
          {portTypeList.map((t) => (
            <FooterLink key={t.slug} href={`/types/${t.slug}`}>
              {t.plural}
            </FooterLink>
          ))}
        </FooterColumn>
        <FooterColumn title="Platforms">
          {families
            .map((family) => platforms.filter((p) => p.family === family).sort((a, b) => b.count - a.count)[0])
            .filter(Boolean)
            .map((p) => (
              <FooterLink key={p.slug} href={`/platforms/${p.slug}`}>
                {p.name}
              </FooterLink>
            ))}
          <FooterLink href="/platforms">All platforms →</FooterLink>
        </FooterColumn>
        <FooterColumn title="Play">
          <FooterLink href="/#play">Play online</FooterLink>
          <FooterLink href="/?access=free#play">Free to play now</FooterLink>
          <FooterLink href="/pc-ports">Native PC ports</FooterLink>
        </FooterColumn>
        <FooterColumn title="Project">
          <FooterLink href="/about">About & methodology</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/donate">Support the project</FooterLink>
          <FooterLink href="/privacy">Privacy</FooterLink>
          <FooterLink href={site.repo} external>
            GitHub repository
          </FooterLink>
          <FooterLink href={`${site.repo}/issues/new/choose`} external>
            Suggest a port
          </FooterLink>
        </FooterColumn>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 font-mono text-[11px] text-muted sm:px-6">
          <span>
            Catalog updated {formatDate(catalog.generatedAt)} · data CC0 · code MIT
          </span>
          <span>
            Built by{" "}
            <a href={site.author.url} className="underline underline-offset-2 hover:text-ink" target="_blank" rel="noreferrer">
              {site.author.name}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{title}</h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const className = "text-sm text-ink-soft transition hover:text-accent-ink";
  return (
    <li>
      {external ? (
        <a href={href} className={className} target="_blank" rel="noreferrer">
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}
