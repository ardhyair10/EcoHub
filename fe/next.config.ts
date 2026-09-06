import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  allowedDevOrigins: ['f54c61c6c349e159-114-8-199-218.serveousercontent.com'],
  experimental: {
    serverActions: {
      allowedOrigins: ['f54c61c6c349e159-114-8-199-218.serveousercontent.com']
    }
  }
};

export default nextConfig;
