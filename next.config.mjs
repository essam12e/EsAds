/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pg"],
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  poweredByHeader: false,
};
export default nextConfig;
