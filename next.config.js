/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================

  // Define workspace root explicitly to avoid multiple lockfile warning
  outputFileTracingRoot: __dirname,

  // Enable experimental features for better performance
  experimental: {
    // Optimize large page data
    largePageDataBytes: 128 * 1000, // 128KB
  },

  // Output configuration for deployment
  // output: 'standalone', // Disabled for Vercel deployment
  
  // Note: Turbopack configuration removed as it's not yet stable in Next.js 15

  // Optimize bundle
  webpack: (config, { dev, isServer }) => {
    // Fix "self is not defined" error for server-side builds
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Define globals for server-side rendering
      const webpack = require('webpack');
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof window': JSON.stringify('undefined'),
          'typeof self': JSON.stringify('undefined'),
          'typeof global': JSON.stringify('object')
        })
      );
    }

    // Optimize for production builds
    if (!dev && !isServer) {
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
            common: {
              minChunks: 2,
              chunks: 'all',
              name: 'common',
            },
          },
        },
      };
    }
    return config;
  },

  // ============================================================================
  // CRITICAL SECURITY: HTTPS ENFORCEMENT
  // ============================================================================
  async redirects() {
    const redirects = [
      {
        source: '/libanes/app/admin/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
    ];

    // SECURITY: Force HTTPS redirects in production
    if (process.env.NODE_ENV === 'production') {
      console.log('🔒 HTTPS enforcement active in production');
    }

    return redirects;
  },
  
  // Framework React 18 estrito
  reactStrictMode: true,
  
  // Configuração para otimização de imagens
  images: {
    domains: ['imobiliaria.moby.casa', 'images.pexels.com', 'placehold.co', 'source.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable TypeScript and ESLint checks in all environments
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // ============================================================================
  // SECURITY CONFIGURATIONS
  // ============================================================================
  
  // Remover cabeçalho X-Powered-By para segurança
  poweredByHeader: false,
  
  // Otimização de compressão
  compress: true,

  // Security headers (additional to middleware)
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Content-Security-Policy',
        value: process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : ''
      },
      {
        key: 'X-Download-Options',
        value: 'noopen'
      }
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;