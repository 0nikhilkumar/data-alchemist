/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    // Handle client-side packages that might cause issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize for production
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  },
  // Ensure proper handling of dynamic imports
  transpilePackages: ['xlsx', 'papaparse'],
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Handle static file serving
  trailingSlash: false,
  
  // Optimize bundle size
  swcMinify: true,
};

module.exports = nextConfig;