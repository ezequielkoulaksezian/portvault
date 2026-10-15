import type { Faq } from "@/lib/seo";

export const siteFaqs: Faq[] = [
  {
    question: "What is an unofficial PC port?",
    answer:
      "An unofficial PC port is a fan-made native version of a game that was originally released on a console or an old computer. Instead of emulating the original hardware, the game's code runs directly on Windows, Linux or macOS, which allows higher resolutions, widescreen, high frame rates, modern controls and mods.",
  },
  {
    question: "Are PC ports legal?",
    answer:
      "The ports themselves contain no copyrighted game data: they are code written or reconstructed by the community, and they need the files from a copy of the game you own. Using a port with your own legally obtained copy is the intended way to play. Distributing ROMs, ISOs or game assets is not legal, and PortVault never links to them.",
  },
  {
    question: "Do I need the original game?",
    answer:
      "Almost always. Most ports ask for a ROM, a disc image or the original game files the first time you launch them, and extract the assets they need. A few engine remakes of freeware games or demos can be played without them.",
  },
  {
    question: "What is the difference between a decompilation and a recompilation?",
    answer:
      "A decompilation rewrites the game's machine code by hand into readable C or C++ that compiles back into the original, which makes deep changes easy. A static recompilation translates the original binary into native code automatically with tools like N64Recomp or XenonRecomp. Recompilations appear faster; decompilations are easier to modify.",
  },
  {
    question: "Is a port better than an emulator?",
    answer:
      "For supported games, usually yes. A native port uses far less CPU, has no emulation glitches, and can add features an emulator cannot, such as true widescreen, unlocked frame rates, mod loaders and modern menus. Emulators remain the better choice for games without a port and for accuracy-focused play.",
  },
  {
    question: "Which games does PortVault include?",
    answer:
      "Games with at least one port that can be played today: decompilation ports, static recompilations, source ports and engine remakes with a working project page, reasonable community adoption and a playable state. Research-only decompilations, server emulators, mods and fan games are not listed.",
  },
  {
    question: "How often is the catalog updated?",
    answer:
      "The catalog is rebuilt automatically every week from public data sources, including the latest GitHub release of every port, and a set of hand-written curation rules is applied on every rebuild. You can suggest a port or report a problem on the GitHub repository at any time.",
  },
  {
    question: "Where do the covers and game facts come from?",
    answer:
      "Cover art, release years, developers, publishers, genres and summaries come from Wikipedia and Wikidata. Each game page links to its source. Port data comes from the community-maintained awesome-decomp-games database (CC0) and the curated awesome-unofficial-pc-ports list.",
  },
  {
    question: "Can I play these ports on Linux, macOS or Steam Deck?",
    answer:
      "Many of them, yes. Most recompilations and source ports publish builds for Windows and Linux, and several also support macOS and Steam Deck. Each port's release page lists the supported systems.",
  },
];
