import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 95],
  },
  turbopack: {
    rules: {
      "*.wgsl": {
        loaders: ["@vgpu/wgsl/loader-webpack"],
        as: "*.js",
      },
    },
  },
  webpack: (config) => {
    config.module?.rules?.push({
      test: /\.wgsl$/,
      use: "@vgpu/wgsl/loader-webpack",
    });
    return config;
  },
};

export default nextConfig;
