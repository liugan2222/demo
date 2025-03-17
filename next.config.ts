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
    // remotePatterns: [
    //   {
    //     protocol: 'http',
    //     hostname: '47.88.28.103',
    //     port: '8080',
    //     pathname: '/api/files/**',
    //   },
    // ],
    remotePatterns: [
      {
        protocol: 'https', // 改为https
        hostname: 'fp.ablueforce.com', // 新域名
        // port: '8080',  // 移除端口
        pathname: '/api/files/**',
      },
    ],
  },

  // api: {
  //   bodyParser: {
  //     sizeLimit: '10mb' // 根据需求调整大小限制
  //   }
  // },

  api: {
    bodyParser: false, // 禁用自动解析
  },  

  // next.config.js 补充安全头
  async headers() {
    // return [
    //   {
    //     source: '/api/auth/:path*',
    //     headers: [
    //       { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
    //       { key: 'Access-Control-Allow-Credentials', value: 'true' }
    //     ]
    //   }
    //   ,{
    //     source: '/api/proxy/:path*',
    //     headers: [
    //       { key: 'Access-Control-Allow-Origin', value: '*' },
    //       { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
    //       { key: 'Access-Control-Allow-Credentials', value: 'true' }
    //     ]
    //   }
    // ]
    return [
      {
        source: '/api/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Origin', 
            value: 'https://fp.ablueforce.com' // 或前端域名
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          // { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' }
        ]
      }
    ]
  },
  
  // 如果你使用了 API 代理，可能还需要添加以下配置
  async rewrites() {
    // return [
    //   {
    //     source: '/api/proxy/:path*',
    //     destination: '/api/proxy/:path*',
    //   },
    //   // 新增认证服务代理
    //   {
    //     source: '/api/auth/:path*',
    //     destination: 'http://47.88.28.103:9000/:path*',
    //   }
    // ]
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://fp.ablueforce.com/api/:path*', 
      }
      ,
      {
        source: '/api/auth/:path*',
        destination: 'https://fp.ablueforce.com/:path*', // 根据nginx路由结构调整
      }
    ]
  },
}


module.exports = nextConfig