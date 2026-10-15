import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono, Pixelify_Sans } from "next/font/google";
import { ads, site } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdSlot } from "@/components/ad-slot";
import { JsonLd } from "@/components/json-ld";
import { themeScript } from "@/components/theme-toggle";
import { websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const pixel = Pixelify_Sans({ variable: "--font-pixelify", subsets: ["latin"], weight: ["500", "600"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  authors: [site.author],
  creator: site.author.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: `${site.name} · ${site.tagline}`, description: site.description },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  ...(ads.client ? { other: { "google-adsense-account": ads.client } } : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e12" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="alternate" type="text/plain" title="LLM summary" href="/llms.txt" />
      </head>
      <body className={`${inter.variable} ${pixel.variable} ${mono.variable} font-sans antialiased`}>
        <a
          href="#main"
          className="sr-only z-50 rounded bg-accent px-3 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <AdSlot />
        <SiteFooter />
        <JsonLd data={websiteJsonLd()} />
        {ads.client && (
          <Script
            id="adsense"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.client}`}
          />
        )}
      </body>
    </html>
  );
}
