const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TÁCH BIỆT: Chỉ static export khi build production
  // Development sẽ dùng server-side rendering bình thường
  ...(process.env.NODE_ENV === 'production' && process.env.BUILD_FOR_HOSTING === 'true' ? {
    output: 'export',
    trailingSlash: true,
  } : {}),
  images: {
    unoptimized: process.env.NODE_ENV === 'production' && process.env.BUILD_FOR_HOSTING === 'true',
    domains: [
      'localhost',
      '127.0.0.1',
      ...(process.env.NEXT_PUBLIC_IMAGE_DOMAINS 
        ? process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(',') 
        : [])
    ],
  },
  // Embed environment variables vào static HTML (chỉ khi build production)
  ...(process.env.NODE_ENV === 'production' && process.env.BUILD_FOR_HOSTING === 'true' ? {
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_IMAGE_DOMAINS: process.env.NEXT_PUBLIC_IMAGE_DOMAINS,
    },
  } : {}),
}

module.exports = withPWA(nextConfig)

