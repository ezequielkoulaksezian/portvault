import { site } from "@/config/site";
import { getPlatform, portTypes, type Game } from "@/lib/catalog";
import { formatDate, listToText, plural } from "@/lib/format";

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;

export type Faq = { question: string; answer: string };

/** Short, self-contained answers for answer engines and the on-page FAQ. */
export function gameFaqs(game: Game): Faq[] {
  const platform = getPlatform(game.platform)?.name ?? "its original platform";
  const label = `${game.title} (${platform}${game.year ? `, ${game.year}` : ""})`;
  const faqs: Faq[] = [];

  if (game.web.length) {
    const free = game.web.filter((w) => w.access === "free");
    const own = game.web.filter((w) => w.access === "own-files");
    faqs.push({
      question: `Can I play ${game.title} in my browser?`,
      answer: `Yes. ${label} runs in a browser tab with ${listToText(game.web.map((w) => w.name))}, with no installation.`,
    });
    faqs.push({
      question: `Can I play ${game.title} online for free?`,
      answer: free.length
        ? `Yes. ${listToText(free.map((w) => w.name))} ${free.length === 1 ? "plays" : "play"} instantly with legally free data (${free[0].note.replace(/\.$/, "").toLowerCase()}).${
            own.length
              ? ` ${listToText(own.map((w) => w.name))} ${own.length === 1 ? "needs" : "need"} files from your own copy.`
              : ""
          }`
        : `The browser ${game.web.length === 1 ? "port is" : "ports are"} free, but ${game.web.length === 1 ? "it needs" : "they need"} the game files from a copy you own: the game itself is not included.`,
    });
  }

  if (game.ports.length) {
    const best = game.ports[0];
    const others = game.ports.slice(1).map((p) => p.name);
    faqs.push({
      question: `Is there a PC port of ${game.title}?`,
      answer: `Yes. ${label} has ${plural(game.ports.length, "unofficial native port")}: ${listToText(
        game.ports.map((p) => p.name),
      )}. These are fan projects that run natively instead of through an emulator.`,
    });
    faqs.push({
      question: `Which port of ${game.title} should I use?`,
      answer: `${best.name} is the ${best.recommended ? "recommended" : "most established"} option. It is a ${portTypes[
        best.type
      ].name.toLowerCase()}${
        best.release
          ? ` and its latest release is ${best.release}${best.releaseDate ? ` (${formatDate(best.releaseDate)})` : ""}`
          : ""
      }.${others.length ? ` Alternatives: ${listToText(others)}.` : ""}`,
    });
    faqs.push({
      question: `Do I need the original game to play ${game.title} on PC?`,
      answer:
        "Usually yes. Ports like these contain no copyrighted game data: you supply the ROM, disc image or game files from a copy you own, and the port uses them on first launch. PortVault never links to ROMs or ISOs.",
    });
  }
  return faqs;
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function gameJsonLd(game: Game) {
  const platform = getPlatform(game.platform);
  const url = absoluteUrl(`/games/${game.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": `${url}#game`,
    name: game.title,
    url,
    ...(game.aka.length ? { alternateName: game.aka } : {}),
    ...(game.summary ? { description: game.summary } : {}),
    ...(game.cover ? { image: game.cover.url } : {}),
    ...(game.year ? { datePublished: String(game.year) } : {}),
    ...(game.genres.length ? { genre: game.genres } : {}),
    ...(platform ? { gamePlatform: platform.name } : {}),
    ...(game.developers.length ? { author: game.developers.map((name) => ({ "@type": "Organization", name })) } : {}),
    ...(game.publishers.length
      ? { publisher: game.publishers.map((name) => ({ "@type": "Organization", name })) }
      : {}),
    ...(game.wikipedia ? { sameAs: [game.wikipedia.url] } : {}),
    ...(game.web.length
      ? {
          playMode: game.web.some((w) => w.multiplayer) ? ["SinglePlayer", "MultiPlayer"] : "SinglePlayer",
          potentialAction: game.web.map((w) => ({ "@type": "PlayAction", name: w.name, target: w.url })),
        }
      : {}),
    workExample: [
      ...game.web.map((w) => ({
        "@type": "WebApplication",
        name: w.name,
        applicationCategory: "GameApplication",
        browserRequirements: "Requires a modern browser with WebAssembly",
        operatingSystem: "Any",
        url: w.url,
        description: w.note,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      })),
      ...game.ports.map((p) => ({
        "@type": "SoftwareApplication",
        name: p.name,
        applicationCategory: "GameApplication",
        operatingSystem: "Windows, Linux, macOS",
        url: p.homepage || p.url,
        ...(p.repo ? { codeRepository: p.url } : {}),
        ...(p.release ? { softwareVersion: p.release } : {}),
        ...(p.releaseDate ? { dateModified: p.releaseDate } : {}),
        ...(p.license ? { license: `https://spdx.org/licenses/${p.license}.html` } : {}),
        ...(p.description ? { description: p.description } : {}),
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      })),
    ],
  };
}

export function itemListJsonLd(name: string, games: Game[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: games.length,
    itemListElement: games.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/games/${g.slug}`),
      name: g.title,
    })),
  };
}

export function websiteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      description: site.description,
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${site.url}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: absoluteUrl("/icon.svg"),
      sameAs: [site.repo],
    },
  ];
}
