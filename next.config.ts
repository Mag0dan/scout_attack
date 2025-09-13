

const nextConfig = {
  // experimental: {
  //   missingSuspenseWithCSRBailout: false
  // },
  env: {
    SERVER_URL: process.env.SERVER_URL
  },
  output: 'standalone',
};

export default nextConfig;
