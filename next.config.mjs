import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    // Type checking is run separately via `pnpm typecheck` to avoid OOM
    // in memory-constrained devcontainer environments (virtiofs + limited RAM)
    ignoreBuildErrors: true,
  },
  
  ...(process.env.NODE_ENV === "development" ? { reactStrictMode: true } : {})
}

export default nextConfig
