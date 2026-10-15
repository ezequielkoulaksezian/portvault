import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Search engines and AI assistants are welcome: the catalog is meant to be found and cited.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-SearchBot",
          "Claude-User",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
