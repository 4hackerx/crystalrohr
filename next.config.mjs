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
    
};

export default nextConfig;
