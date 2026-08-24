import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/shared", "@workspace/env"],
}

export default nextConfig
