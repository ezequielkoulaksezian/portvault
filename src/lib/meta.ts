import platformData from "../../data/platforms.json";

export type PortType =
  | "decompilation"
  | "static-recomp"
  | "source-port"
  | "engine-remake";

export type Platform = {
  slug: string;
  name: string;
  short: string;
  family: string;
};

export const platforms: Platform[] = (
  platformData as (Platform & { match: string[] })[]
).map(({ slug, name, short, family }) => ({ slug, name, short, family }));

const platformBySlug = new Map(platforms.map((p) => [p.slug, p]));

export function getPlatform(slug: string): Platform | undefined {
  return platformBySlug.get(slug);
}

export const families = [
  "Nintendo",
  "PlayStation",
  "Xbox",
  "Sega",
  "Arcade",
  "Computers",
  "Mobile",
] as const;

export const portTypes: Record<
  PortType,
  {
    slug: PortType;
    name: string;
    plural: string;
    short: string;
    blurb: string;
    explainer: string;
  }
> = {
  decompilation: {
    slug: "decompilation",
    name: "Decompilation port",
    plural: "Decompilation ports",
    short: "Decomp",
    blurb:
      "The original code rewritten by hand as matching C/C++, then built natively for modern systems.",
    explainer:
      "A decompilation project reverse-engineers a game's machine code into C or C++ source that compiles back into a byte-identical copy of the original. Once the code is understood, it can be ported to PC like any other program: modern renderers, widescreen, high frame rates, mods and fixes become possible. Ship of Harkinian (Ocarina of Time) and Starship (Star Fox 64) are well-known examples.",
  },
  "static-recomp": {
    slug: "static-recomp",
    name: "Static recompilation",
    plural: "Static recompilations",
    short: "Recomp",
    blurb:
      "The original game binary translated automatically into native PC code.",
    explainer:
      "Static recompilation tools such as N64Recomp and XenonRecomp translate every instruction of the original executable into equivalent C code ahead of time, which is then compiled for modern CPUs. Graphics and audio are handled by a native runtime instead of an emulator, so the result runs like a real PC game with high frame rates and widescreen support. Zelda 64: Recompiled and Unleashed Recompiled are famous examples.",
  },
  "source-port": {
    slug: "source-port",
    name: "Source port",
    plural: "Source ports",
    short: "Source port",
    blurb:
      "A port of released or reconstructed source code to modern operating systems.",
    explainer:
      "A source port takes a game's source code, either officially released by the developer (Doom, Quake, Descent) or reconstructed by a decompilation, and adapts it to modern operating systems, graphics APIs and input devices. Source ports usually keep the original gameplay while adding quality-of-life features such as higher resolutions, controller support and mod loaders.",
  },
  "engine-remake": {
    slug: "engine-remake",
    name: "Engine remake",
    plural: "Engine remakes",
    short: "Engine remake",
    blurb:
      "A clean-room reimplementation of the engine that loads the original game's data files.",
    explainer:
      "An engine remake (or reimplementation) is new code written from scratch that behaves like the original engine and reads the original game's data files. It contains no original code at all, which makes it legally robust and easy to port to many platforms. OpenMW (Morrowind), DevilutionX (Diablo) and OpenRCT2 (RollerCoaster Tycoon 2) are popular examples.",
  },
};

export const portTypeList = Object.values(portTypes);

/** Slim record sent to the client for live search, filtering and cards. */
export type GameIndexEntry = {
  slug: string;
  title: string;
  platform: string;
  family: string;
  year: number | null;
  types: PortType[];
  stars: number;
  lastUpdate: string | null;
  multiplayer: boolean;
  browser: boolean;
  hasRelease: boolean;
  portCount: number;
  topPort: string;
  cover: string | null;
  search: string;
};

export function normalizeText(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
