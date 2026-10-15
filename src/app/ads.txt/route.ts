import { ads } from "@/config/site";

export const dynamic = "force-static";

// Authorizes Google AdSense to sell ad space on this domain once NEXT_PUBLIC_ADSENSE_CLIENT is set.
export function GET() {
  const publisher = ads.client.replace(/^ca-/, "");
  if (!publisher) return new Response("Not configured\n", { status: 404 });
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
