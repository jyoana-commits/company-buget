import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: true },
      { source: "/signup", destination: "/auth/signup", permanent: true },
      { source: "/dashboard", destination: "/budget", permanent: true },
    ];
  },
  //output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

