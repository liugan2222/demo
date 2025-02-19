const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // 添加这行来确保正确的构建输出
  experimental: {
    serverActions: true, // 启用服务器操作
  },
  typescript: {
    ignoreBuildErrors: true, // 可选：如果你想在构建时忽略 TypeScript 错误
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '47.88.28.103',
        port: '8080',
        pathname: '/api/files/**',
      },
    ],
  },
  // 如果你使用了 API 代理，可能还需要添加以下配置
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: '/api/proxy/:path*',
      },
    ]
  },
}


module.exports = nextConfig