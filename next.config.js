require('dotenv').config()
const withPlugins = require('next-compose-plugins')
const withBundleAnalyzer = require('@next/bundle-analyzer')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

const bundleAnalyzerConfig = {
  enabled: process.env.ANALYZE === 'true',
}

const nextConfig = {
  target: 'serverless',
  env: {
    SERVER_ENDPOINT: process.env.SERVER_ENDPOINT,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
}

module.exports = withPlugins(
  [
    {
      webpack(config, { buildId, dev, isServer, defaultLoaders, webpack }) {
        config.plugins.push(new AntdDayjsWebpackPlugin())
        return config
      },
    },
    withBundleAnalyzer(bundleAnalyzerConfig),
  ],
  nextConfig
)
