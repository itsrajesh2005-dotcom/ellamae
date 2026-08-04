/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.79'],
}

export default nextConfig
