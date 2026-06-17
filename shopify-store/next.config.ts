import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Scope file tracing to this app. The monorepo has multiple lockfiles, so Next
  // otherwise infers the repo root (/vercel/path0) and warns that it mismatches
  // turbopack.root. shopify-store is self-contained (own package-lock + node_modules),
  // so both must point here.
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      // AWS S3 — direct bucket URL
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
      // AWS CloudFront CDN
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
      // Dev / placeholder
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.nike.com',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'res.cloudinary.com', 
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
