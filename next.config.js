require('dotenv').config()
const fs = require('fs')
const path = require('path')
const withLess = require('@zeit/next-less')
const withPlugins = require('next-compose-plugins')
const withBundleAnalyzer = require('@next/bundle-analyzer')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const lessToJS = require('less-vars-to-js')

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

const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, './src/styles/lessvars.less'), 'utf8')
)

const lessConfig = {
  lessLoaderOptions: {
    javascriptEnabled: true,
    modifyVars: themeVariables,
  },
  webpack: (config, { isServer, dev }) => {
    config.node = {
      fs: 'empty',
    }

    config.plugins.push(new AntdDayjsWebpackPlugin())

    if (isServer) {
      const antStyles = /(antd\/.*?\/style).*(?<![.]js)$/
      const origExternals = [...config.externals]
      config.externals = [
        (context, request, callback) => {
          if (request.match(antStyles)) return callback()
          if (typeof origExternals[0] === 'function') {
            origExternals[0](context, request, callback)
          } else {
            callback()
          }
        },
        ...(typeof origExternals[0] === 'function' ? [] : origExternals),
      ]

      config.module.rules.unshift({
        test: antStyles,
        use: 'null-loader',
      })
    }

    const builtInLoader = config.module.rules.find((rule) => {
      if (rule.oneOf) {
        return (
          rule.oneOf.find((deepRule) => {
            if (deepRule.test && deepRule.test.toString().includes('/a^/')) {
              return true
            }
            return false
          }) !== undefined
        )
      }
      return false
    })

    if (typeof builtInLoader !== 'undefined') {
      config.module.rules.push({
        oneOf: [
          ...builtInLoader.oneOf.filter((rule) => {
            return (rule.test && rule.test.toString().includes('/a^/')) !== true
          }),
        ],
      })
    }

    config.resolve.alias['@'] = path.resolve(__dirname)
    return config
  },
}

module.exports = withPlugins(
  [[withLess(lessConfig)], withBundleAnalyzer(bundleAnalyzerConfig)],
  nextConfig
)
