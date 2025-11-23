import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  // Transpile Apollo Client packages to fix module resolution
  transpilePackages: ['@apollo/client'],
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
  // Webpack config for non-Turbopack builds (when using --webpack flag)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Better module resolution for Apollo Client
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Ensure Apollo Client modules are properly resolved
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };
    
    return config;
  },
};

export default nextConfig;
