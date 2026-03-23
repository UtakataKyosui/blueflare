import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import createNextIntlPlugin from "next-intl/plugin";

initOpenNextCloudflareForDev();

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    // Type checking is run separately via `pnpm typecheck` to avoid OOM
    // in memory-constrained devcontainer environments (virtiofs + limited RAM)
    ignoreBuildErrors: true,
  },

  ...(process.env.NODE_ENV === "development" ? { reactStrictMode: true } : {}),
};

export default withNextIntl(nextConfig);
