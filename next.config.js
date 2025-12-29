/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // Suppress webpack cache warnings (common on Windows/WSL)
    // These warnings don't affect functionality
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      }
      
      // Use a simpler cache strategy on Windows to avoid warnings
      if (process.platform === 'win32' && config.cache) {
        config.cache = {
          ...config.cache,
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
        }
      }
    }
    
    return config
  },
  // Suppress webpack warnings in console
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
