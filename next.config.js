/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ['github.com'],
  },
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime !== "nodejs") return config;
    return {
      ...config,
      externals: [
        ...config.externals,
        'everything-json',
      ],
    }
  }
};
