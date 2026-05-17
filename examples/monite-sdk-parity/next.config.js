/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Accept either BLERP_API_URL (preferred) or CLERK_API_URL
    // (Clerk-compat alias). Cannot import @blerp/nextjs here because
    // next.config.js runs in Node before bundling resolves workspace
    // deps — so the dual-lookup is inlined.
    const apiUrl =
      process.env.BLERP_API_URL ?? process.env.CLERK_API_URL ?? "http://localhost:3000";
    return [
      {
        source: "/v1/:path*",
        destination: `${apiUrl}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
