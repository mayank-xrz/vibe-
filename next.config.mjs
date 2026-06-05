/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'cdn.plaid.com' },
      { hostname: 'plaid-merchant-logos.plaid.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || 'https://singular-cannoli-323f40.netlify.app',
  },
};
export default nextConfig;
