import type { Metadata } from "next";
import { donations, hasDonations, site } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Support PortVault",
  description: "PortVault is free and open source. Donations cover hosting and the time spent keeping the catalog accurate.",
  alternates: { canonical: "/donate" },
};

const methods = [
  {
    key: "githubSponsors" as const,
    name: "GitHub Sponsors",
    detail: "Monthly or one-time, by card. GitHub takes no fee, so the whole amount reaches the project.",
    cta: "Sponsor on GitHub",
  },
  {
    key: "kofi" as const,
    name: "Ko-fi",
    detail: "One-time donations by card or PayPal, no account needed.",
    cta: "Donate on Ko-fi",
  },
  {
    key: "cafecito" as const,
    name: "Cafecito",
    detail: "Para donar desde Argentina en pesos, con Mercado Pago.",
    cta: "Invitar un cafecito",
  },
];

export default function DonatePage() {
  const available = methods.filter((m) => donations[m.key]);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Support", path: "/donate" }]} />
      <h1 className="mt-4 font-pixel text-4xl text-ink sm:text-5xl">Support the project</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">
        {site.name} is free, ad-light and open source. Donations pay for hosting and for the hours spent reviewing
        new ports, fixing data and keeping every link working.
      </p>

      {hasDonations ? (
        <ul className="mt-8 space-y-3">
          {available.map((m) => (
            <li
              key={m.key}
              className="flex flex-col gap-3 rounded-md border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-ink">{m.name}</p>
                <p className="mt-1 text-sm text-muted">{m.detail}</p>
              </div>
              <a
                href={donations[m.key]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-110 dark:text-bg"
              >
                {m.cta}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-md border border-dashed border-line-strong bg-surface p-6">
          <p className="font-pixel text-xl text-ink">Donations open soon</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Donation links are being set up. Meanwhile, the best way to help is to star the repository, share the
            site, and suggest ports that are missing.
          </p>
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-semibold text-bg hover:opacity-90"
          >
            Star on GitHub
          </a>
        </div>
      )}

      <h2 className="mt-12 font-pixel text-2xl text-ink">Other ways to help</h2>
      <ul className="mt-4 space-y-2 text-ink-soft">
        <li>
          ·{" "}
          <a href={`${site.repo}/issues/new/choose`} target="_blank" rel="noreferrer" className="text-accent-ink underline underline-offset-2">
            Suggest a missing port
          </a>{" "}
          or report a broken link.
        </li>
        <li>· Support the port developers directly. Most of them accept donations on their project pages.</li>
        <li>· Share PortVault with someone who still has their old cartridges in a drawer.</li>
      </ul>
    </div>
  );
}
