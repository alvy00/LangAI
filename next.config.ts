import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude node modules like 'tls' and 'net' that are only available on the server
      config.resolve.fallback = {
        tls: false,
        net: false,
        fs: false, // another common Node.js module that may cause issues
        child_process: false, // another potential source of errors
      };
    }
    return config;
  },
};

export default nextConfig;
