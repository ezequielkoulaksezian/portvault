import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { catalog, portTypeList, stats } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "About PortVault: how unofficial PC ports work and how the catalog is built",
  description:
    "What decompilations, static recompilations, source ports and engine remakes are, what PortVault includes, where the data comes from and how to contribute.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <Breadcrumbs items={[{ name: "About", path: "/about" }]} />
      <h1 className="mt-4 font-pixel text-4xl text-ink sm:text-5xl">About PortVault</h1>
      <div className="prose-retro mt-6 text-ink-soft">
        <p className="text-lg">
          PortVault is a free, open-source guide to <strong>playing classic games in your browser</strong> and on
          modern PCs. It lists {stats.webGames} games you can play in a browser tab through WebAssembly ports of their
          original engines, and {stats.ports} native PC ports of {stats.nativeGames} games for Windows, Linux, macOS and
          Steam Deck, with links straight to each project.
        </p>

        <h2>Why native ports matter</h2>
        <p>
          For decades the only way to replay console classics on a computer was emulation. Over the last few years
          the community has gone further: games such as Super Mario 64, Ocarina of Time, Majora&apos;s Mask, Jak and
          Daxter and Sonic Unleashed have been reverse-engineered or recompiled into real PC programs. A native
          port runs on far less hardware, fixes original bugs, and adds widescreen, unlocked frame rates, modern
          controls and mod support. The projects are scattered across GitHub, forums and Discord servers, so
          PortVault puts them in one place.
        </p>

        <h2>The four kinds of port</h2>
        <ul>
          {portTypeList.map((t) => (
            <li key={t.slug}>
              <Link href={`/types/${t.slug}`}>{t.plural}</Link>: {t.blurb}
            </li>
          ))}
        </ul>

        <h2>Legal: bring your own copy</h2>
        <p>
          Every project listed here distributes only its own code. To play, you supply the ROM, disc image or game
          files from a copy you own, and the port reads its assets from them. PortVault never hosts or links to
          ROMs, ISOs or copyrighted game assets, and it does not accept suggestions that do. Game titles and cover
          art are the property of their respective owners and are shown only to identify each game.
        </p>

        <h2>Browser games: what gets listed</h2>
        <p>
          Every browser port is opened and checked by hand before it is listed. It must run the original game&apos;s
          engine (ported to WebAssembly or reimplemented), not a video stream, and it must use one of two legal models:
        </p>
        <ul>
          <li>
            <strong>Free</strong>: the data it plays may be shared legally, such as a shareware episode, an official
            demo, a freeware release or open-source assets. We check the files it loads, for example that a Doom port
            ships the shareware <code>doom1.wad</code> and not the full game.
          </li>
          <li>
            <strong>Your files</strong>: the port asks you to load the files from a copy you own, such as a disc image or
            the original data folder.
          </li>
        </ul>
        <p>
          Sites that stream full commercial games without permission are not listed, however popular they are. Plain
          emulator front-ends are also left out: PortVault is about ports.
        </p>

        <h2>Native PC ports: what gets listed</h2>
        <p>A game is listed when at least one of its ports:</p>
        <ul>
          <li>is a decompilation port, static recompilation, source port or engine remake;</li>
          <li>can actually be played today, according to its releases and stated status;</li>
          <li>has a working project page and meaningful community adoption, or is a well-known finished project;</li>
          <li>targets PC or phones (ports to other consoles and VR headsets are left out).</li>
        </ul>
        <p>
          Projects that are only research (unfinished decompilations), server emulators, mods, randomizers and
          original fan games are excluded. Low-effort, auto-generated projects need clear community validation to
          be listed. When a game has several ports, the most user-friendly one is marked <em>Recommended</em>.
        </p>

        <h2>Where the data comes from</h2>
        <ul>
          <li>
            Port data:{" "}
            <a href="https://github.com/SubmitGame/awesome-decomp-games" target="_blank" rel="noreferrer">
              awesome-decomp-games
            </a>{" "}
            (CC0), a database of over 2,000 projects refreshed daily with GitHub metadata and link checks.
          </li>
          <li>
            Recommendations:{" "}
            <a href="https://github.com/Sebastrion/awesome-unofficial-pc-ports" target="_blank" rel="noreferrer">
              awesome-unofficial-pc-ports
            </a>{" "}
            (MIT), a hand-curated list of the easiest ports to install.
          </li>
          <li>
            Game facts, summaries and cover art:{" "}
            <a href="https://www.wikipedia.org/" target="_blank" rel="noreferrer">
              Wikipedia
            </a>{" "}
            and{" "}
            <a href="https://www.wikidata.org/" target="_blank" rel="noreferrer">
              Wikidata
            </a>
            . Summaries are licensed CC BY-SA 4.0 and attributed on each page.
          </li>
          <li>
            Cross-checked against the{" "}
            <a href="https://www.pcgamingwiki.com/wiki/List_of_unofficial_ports" target="_blank" rel="noreferrer">
              PCGamingWiki list of unofficial ports
            </a>
            .
          </li>
        </ul>
        <p>
          The catalog is rebuilt every week. Last update: <strong>{formatDate(catalog.generatedAt)}</strong>.
        </p>

        <h2>Contribute</h2>
        <p>
          PortVault is open source under the MIT license. You can{" "}
          <a href={`${site.repo}/issues/new/choose`} target="_blank" rel="noreferrer">
            suggest a port or report a problem
          </a>
          , or open a pull request against the curation rules in <code>data/overrides.json</code>. See the{" "}
          <a href={site.repo} target="_blank" rel="noreferrer">
            repository
          </a>{" "}
          for details. If the site is useful to you, you can also <Link href="/donate">support the project</Link>.
        </p>
      </div>
    </div>
  );
}
