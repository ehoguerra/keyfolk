import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ["image/webp"],
    qualities: [75, 85],
  },
};

export default nextConfig;
