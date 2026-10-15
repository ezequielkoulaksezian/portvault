export const site = {
  name: "PortVault",
  tagline: "Play classic games in your browser",
  description:
    "Play classic games in your browser: hand-checked WebAssembly ports of Doom, Quake, Diablo, Halo and more, free or with your own game files. Plus every native PC port, decompilation and recompilation.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://portvault.vercel.app").replace(/\/$/, ""),
  locale: "en_US",
  repo: "https://github.com/ezequielkoulaksezian/portvault",
  author: { name: "Ezequiel Koulaksezian", url: "https://github.com/ezequielkoulaksezian" },
  keywords: [
    "play classic games in browser",
    "browser game ports",
    "webassembly games",
    "play doom in browser",
    "play quake online",
    "pc ports",
    "decompilation",
    "static recompilation",
    "source port",
    "n64 recomp",
    "retro games on pc",
    "unofficial pc port",
    "ship of harkinian",
    "zelda64recomp",
    "native port",
  ],
};

/**
 * Donation methods. Leave a URL empty to hide that method; the donate button and page only show
 * the methods that are configured. See docs/PLAN.md, section 5.
 */
export const donations = {
  githubSponsors: process.env.NEXT_PUBLIC_DONATE_GITHUB_SPONSORS ?? "",
  kofi: process.env.NEXT_PUBLIC_DONATE_KOFI ?? "",
  cafecito: process.env.NEXT_PUBLIC_DONATE_CAFECITO ?? "",
};

export const ads = {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
  footerSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? "",
};

export const hasDonations = Object.values(donations).some(Boolean);
