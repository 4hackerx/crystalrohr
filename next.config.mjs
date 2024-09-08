/** @type {import('next').NextConfig} */
const nextConfig = {
  
    async redirects() {
        return [
          {
            source: '/serviceworker/:path*',
            destination: '/:path*', 
            permanent: true,
          },
        ];
      },
  images:{
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  }  
};

export default nextConfig;
