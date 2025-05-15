/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "res.cloudinary.com",
      // Add any other domains you might need for images
    ],
  },
  // Mark Node.js core modules as external to prevent webpack from trying to bundle them
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent client-side bundling of Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        os: false,
        zlib: false,
        http: false,
        https: false,
        net: false,
        tls: false,
        child_process: false,
      };

      // Add 'cloudinary' to the list of externals to skip bundling
      config.externals = [
        ...(config.externals || []),
        { cloudinary: "cloudinary" },
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
