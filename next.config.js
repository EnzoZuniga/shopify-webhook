/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: ".",
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGINS || 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ]
      }
    ]
  }
}

module.exports = nextConfig
