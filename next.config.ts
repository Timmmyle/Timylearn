import type { NextConfig } from "next";

// NEXT_OUTPUT=export: build tĩnh cho app di động (Capacitor) — xem scripts/build-mobile.mjs
const isExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport ? { output: "export" as const, images: { unoptimized: true }, trailingSlash: true } : {}),
  async headers() {
    if (isExport) return [];
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }, { key: "Service-Worker-Allowed", value: "/" }] }];
  },
};
export default nextConfig;
