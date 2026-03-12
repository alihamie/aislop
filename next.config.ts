import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        // Redirect www → non-www (301 permanent)
        source: '/:path*',
        has: [{ type: 'host', value: 'www.aislophub.ai' }],
        destination: 'https://aislophub.ai/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
