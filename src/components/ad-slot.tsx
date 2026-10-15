"use client";

import { useEffect, useRef } from "react";
import { ads } from "@/config/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Google AdSense unit shown at the bottom of every page. It renders nothing until
 * NEXT_PUBLIC_ADSENSE_CLIENT and NEXT_PUBLIC_ADSENSE_SLOT_FOOTER are set. The container
 * reserves its height so the ad does not shift the layout when it loads.
 */
export function AdSlot() {
  const pushed = useRef(false);
  const enabled = Boolean(ads.client && ads.footerSlot);

  useEffect(() => {
    if (!enabled || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [enabled]);

  if (!enabled) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <AdFrame>
        <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-widest text-muted">
          Ad slot (set NEXT_PUBLIC_ADSENSE_CLIENT)
        </div>
      </AdFrame>
    );
  }

  return (
    <AdFrame>
      <ins
        className="adsbygoogle block h-full w-full"
        style={{ display: "block" }}
        data-ad-client={ads.client}
        data-ad-slot={ads.footerSlot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </AdFrame>
  );
}

function AdFrame({ children }: { children: React.ReactNode }) {
  return (
    <aside aria-label="Advertisement" className="no-print mx-auto mt-16 max-w-7xl px-4 sm:px-6">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Advertisement</p>
      <div className="h-[100px] overflow-hidden rounded-md border border-dashed border-line bg-surface sm:h-[120px]">
        {children}
      </div>
    </aside>
  );
}
