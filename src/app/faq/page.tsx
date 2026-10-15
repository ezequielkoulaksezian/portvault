import type { Metadata } from "next";
import { faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { siteFaqs } from "./faqs";

export const metadata: Metadata = {
  title: "FAQ: unofficial PC ports, decompilations and recompilations",
  description:
    "Answers about unofficial PC ports of classic games: what they are, whether they are legal, whether you need the original game, and how decompilations differ from recompilations.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <Breadcrumbs items={[{ name: "FAQ", path: "/faq" }]} />
      <h1 className="mt-4 font-pixel text-4xl text-ink sm:text-5xl">Frequently asked questions</h1>
      <div className="mt-8 space-y-3">
        {siteFaqs.map((f, i) => (
          <details
            key={f.question}
            open={i < 3}
            className="group rounded-md border border-line bg-surface p-4 open:border-line-strong"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <h2>{f.question}</h2>
              <span
                aria-hidden="true"
                className="mt-0.5 font-mono text-accent-ink transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-ink-soft">{f.answer}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(siteFaqs)} />
    </div>
  );
}
