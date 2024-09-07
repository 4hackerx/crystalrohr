/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@xmtp/user-preferences-bindings-wasm"],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  async redirects() {
    return [
      {
        source: "/serviceworker/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
  reactStrictMode: false,
};

export default nextConfig;
