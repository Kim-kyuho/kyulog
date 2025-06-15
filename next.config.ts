import type { NextConfig } from "next";

// next.config.ts
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true, // URL 끝에 슬래시 추가
};

export default nextConfig;
