/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript errors ko ignore karega
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors ko bhi ignore karega
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;