/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TELEGRAM_GROUP_URL: process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL,
  },
};

module.exports = nextConfig;