"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "portvault-theme";

/** Inline script for <head>: applies the saved or system theme before first paint. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

function apply(theme: Theme) {
  const dark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      setTheme((localStorage.getItem(STORAGE_KEY) as Theme) ?? "system");
    } catch {}
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let saved: Theme = "system";
      try {
        saved = (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system";
      } catch {}
      if (saved === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const next: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
  const label: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };

  function cycle() {
    const value = next[theme];
    setTheme(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    apply(value);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink-soft transition hover:border-line-strong hover:text-ink"
      aria-label={`Theme: ${label[theme]}. Switch to ${label[next[theme]]}.`}
      title={`Theme: ${label[theme]}`}
    >
      <ThemeIcon theme={theme} />
      <span className="hidden font-mono uppercase tracking-wider sm:inline">{label[theme]}</span>
    </button>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "light")
    return (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor" shapeRendering="crispEdges">
        <rect x="6" y="6" width="4" height="4" />
        <rect x="7" y="1" width="2" height="3" />
        <rect x="7" y="12" width="2" height="3" />
        <rect x="1" y="7" width="3" height="2" />
        <rect x="12" y="7" width="3" height="2" />
        <rect x="3" y="3" width="2" height="2" />
        <rect x="11" y="3" width="2" height="2" />
        <rect x="3" y="11" width="2" height="2" />
        <rect x="11" y="11" width="2" height="2" />
      </svg>
    );
  if (theme === "dark")
    return (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor" shapeRendering="crispEdges">
        <path d="M6 2h4v1H7v1H6v1H5v6h1v1h1v1h3v1H6v-1H5v-1H4v-1H3V6h1V5h1V4h1V2z" />
        <path d="M10 3h2v1h1v2h1v4h-1v2h-1v1h-2v-1h1v-1h1V6h-1V5h-1V3z" opacity=".35" />
      </svg>
    );
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor" shapeRendering="crispEdges">
      <path d="M2 3h12v8H2V3zm1 1v6h10V4H3z" />
      <rect x="3" y="4" width="5" height="6" />
      <rect x="6" y="12" width="4" height="1" />
      <rect x="4" y="13" width="8" height="1" />
    </svg>
  );
}
