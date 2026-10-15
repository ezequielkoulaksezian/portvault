import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-wider text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((item, i) => (
            <li key={item.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-ink-soft">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-accent-ink">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}
