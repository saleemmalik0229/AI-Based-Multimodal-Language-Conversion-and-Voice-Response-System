import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CORS headers are dynamically and centrally handled via src/middleware.ts
  // and src/lib/cors.ts to accurately support https://www.web-a2z.com,
  // https://web-a2z.com, and sandboxed iframe environments.
};

export default nextConfig;
