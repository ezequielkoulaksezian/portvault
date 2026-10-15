import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  images: {
    // Covers come from Wikimedia and are served resized as AVIF/WebP from this domain.
    remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org", pathname: "/wikipedia/**" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [384, 640, 828, 1080],
    imageSizes: [48, 96, 160, 240, 320],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
