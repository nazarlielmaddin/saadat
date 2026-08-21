import type { NextConfig } from "next";

/**
 * Local dev/prod: normal server build.
 * GitHub Pages (EXPORT=1): static export with basePath matching the repo name.
 */
const isExport = process.env.EXPORT === "1";
const basePath = isExport ? "/saadat" : "";

const nextConfig: NextConfig = {
  basePath,
  ...(isExport
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;