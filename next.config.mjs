/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Fanpage estática na raiz
      {
        source: "/",
        destination: "/index.html",
      },
      // Proxy para API backend
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
