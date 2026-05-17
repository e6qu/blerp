/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Accept either BLERP_API_URL (preferred) or CLERK_API_URL
    // (Clerk-compat alias). Cannot import @blerp/nextjs here because
    // next.config.js runs in Node before bundling resolves workspace
    // deps — so the dual-lookup is inlined. BUG-74 (codex r11): strip
    // a trailing `/v1` so Clerk-style URLs don't compound into
    // `/v1/v1/...` after the rewrite below. BUG-79/80 (codex r15):
    // coerce blanks to undefined + strip trailing `/`.
    const nonBlank = (v) => (v && v.trim() !== "" ? v : undefined);
    const apiUrl = (
      nonBlank(process.env.BLERP_API_URL) ??
      nonBlank(process.env.CLERK_API_URL) ??
      "http://localhost:3000"
    )
      .replace(/\/v1\/?$/i, "")
      .replace(/\/+$/, "");
    return [
      {
        source: "/v1/:path*",
        destination: `${apiUrl}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
