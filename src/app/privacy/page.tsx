import type { Metadata } from "next";
import { site } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles data, cookies and advertising.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Privacy", path: "/privacy" }]} />
      <h1 className="mt-4 font-pixel text-4xl text-ink sm:text-5xl">Privacy policy</h1>
      <div className="prose-retro mt-6 text-ink-soft">
        <p>Last updated: October 15, 2026.</p>
        <h2>What we collect</h2>
        <p>
          {site.name} has no accounts, forms or comments and does not collect personal information. Your theme
          choice (light, dark or automatic) is stored in your own browser&apos;s local storage and never leaves your
          device. Our hosting provider, Vercel, processes standard server logs (such as IP address and user agent)
          to deliver the site and protect it from abuse.
        </p>
        <h2>Advertising</h2>
        <p>
          To cover its costs, {site.name} may show ads served by Google AdSense. Google and its partners use
          cookies to serve ads based on your previous visits to this and other websites. You can opt out of
          personalized advertising in{" "}
          <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
            Google Ads Settings
          </a>
          , and learn more in{" "}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
            how Google uses information from sites that use its services
          </a>
          . When ads are enabled, visitors in the European Economic Area, the United Kingdom and Switzerland are asked for consent through Google’s consent message before
          any advertising cookies are set.
        </p>
        <h2>Images and external links</h2>
        <p>
          Cover art is loaded from Wikimedia (upload.wikimedia.org). Links to port projects take you to third-party
          sites such as GitHub, which have their own privacy policies.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be raised by opening an issue on the{" "}
          <a href={site.repo} target="_blank" rel="noreferrer">
            GitHub repository
          </a>
          .
        </p>
      </div>
    </div>
  );
}
