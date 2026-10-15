/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      { source: "/Delibery", destination: "/delivery", permanent: false },
    ];
  },
};

export default nextConfig;
