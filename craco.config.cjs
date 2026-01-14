/* eslint-env node */
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const { execSync } = require('child_process')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const { IgnorePlugin, ProvidePlugin } = require('webpack')
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin')

let commitHash = 'quackswap-v1.0.0'
try {
  commitHash = execSync('git rev-parse HEAD').toString().trim()
} catch (error) {
  // Not a git repository, use default version
  console.log('Not a git repository, using default version:', commitHash)
}
const isProduction = process.env.NODE_ENV === 'production'

process.env.REACT_APP_GIT_COMMIT_HASH = commitHash

// Linting and type checking are only necessary as part of development and testing.
// Omit them from production builds, as they slow down the feedback loop.
// Can also be disabled via DISABLE_TYPECHECK=true environment variable
const shouldLintOrTypeCheck = !isProduction && process.env.DISABLE_TYPECHECK !== 'true'

function getCacheDirectory(cacheName) {
  // Include the trailing slash to denote that this is a directory.
  return `${path.join(__dirname, 'node_modules/.cache/', cacheName)}/`
}

module.exports = {
  eslint: {
    enable: shouldLintOrTypeCheck,
    pluginOptions(eslintConfig) {
      return Object.assign(eslintConfig, {
        cache: true,
        cacheLocation: getCacheDirectory('eslint'),
        ignorePath: '.gitignore',
        // Use our own eslint/plugins/config, as overrides interfere with caching.
        // This ensures that `yarn start` and `yarn lint` share one cache.
        eslintPath: require.resolve('eslint'),
        resolvePluginsRelativeTo: null,
        baseConfig: null,
      })
    },
  },
  typescript: {
    enableTypeChecking: shouldLintOrTypeCheck,
  },
  jest: {
    configure(jestConfig) {
      return Object.assign(jestConfig, {
        cacheDirectory: getCacheDirectory('jest'),
        transform: {
          ...Object.entries(jestConfig.transform).reduce((transform, [key, value]) => {
            if (value.match(/babel/)) return transform
            return { ...transform, [key]: value }
          }, {}),
          // Transform vanilla-extract using its own transformer.
          // See https://sandroroth.com/blog/vanilla-extract-cra#jest-transform.
          '\\.css\\.ts$': '@vanilla-extract/jest-transform',
          '\\.(t|j)sx?$': '@swc/jest',
        },
        // Use d3-arrays's build directly, as jest does not support its exports.
        transformIgnorePatterns: ['d3-array'],
        moduleNameMapper: {
          'd3-array': 'd3-array/dist/d3-array.min.js',
        },
      })
    },
  },
  webpack: {
    plugins: [
      // Webpack 5 does not polyfill node globals, so we do so for those necessary:
      new ProvidePlugin({
        // - react-markdown requires process.cwd
        process: 'process/browser.js',
      }),
      new VanillaExtractPlugin(),
      new RetryChunkLoadPlugin({
        cacheBust: `function() {
          return 'cache-bust=' + Date.now();
        }`,
        // Retries with exponential backoff (500ms, 1000ms, 2000ms).
        retryDelay: `function(retryAttempt) {
          return 2 ** (retryAttempt - 1) * 500;
        }`,
        maxRetries: 3,
      }),
    ],
    configure: (webpackConfig) => {
      // Configure webpack plugins:
      webpackConfig.plugins = webpackConfig.plugins
        .map((plugin) => {
          // CSS ordering is mitigated through scoping / naming conventions, so we can ignore order warnings.
          // See https://webpack.js.org/plugins/mini-css-extract-plugin/#remove-order-warnings.
          if (plugin instanceof MiniCssExtractPlugin) {
            plugin.options.ignoreOrder = true
          }

          // Disable TypeScript's config overwrite, as it interferes with incremental build caching.
          // This ensures that `yarn start` and `yarn typecheck` share one cache.
          if (plugin.constructor.name == 'ForkTsCheckerWebpackPlugin') {
            delete plugin.options.typescript.configOverwrite
          }

          return plugin
        })
        .filter((plugin) => {
          // Case sensitive paths are already enforced by TypeScript.
          // See https://www.typescriptlang.org/tsconfig#forceConsistentCasingInFileNames.
          if (plugin instanceof CaseSensitivePathsPlugin) return false

          // IgnorePlugin is used to tree-shake moment locales, but we do not use moment in this project.
          if (plugin instanceof IgnorePlugin) return false

          return true
        })

      // Configure webpack resolution:
      // Resolve optional polyfills safely (do not throw if not installed):
      let osBrowser = false
      let cryptoBrowser = false
      try { osBrowser = require.resolve('os-browserify/browser') } catch (e) {}
      try { cryptoBrowser = require.resolve('crypto-browserify') } catch (e) {}

      webpackConfig.resolve = Object.assign(webpackConfig.resolve, {
        plugins: webpackConfig.resolve.plugins.map((plugin) => {
          // Allow vanilla-extract in production builds.
          // This is necessary because create-react-app guards against external imports.
          // See https://sandroroth.com/blog/vanilla-extract-cra#production-build.
          if (plugin instanceof ModuleScopePlugin) {
            plugin.allowedPaths.push(path.join(__dirname, 'node_modules/@vanilla-extract/webpack-plugin'))
          }

          return plugin
        }),
        // Alias to exclude problematic packages and redirect web3-react to compatibility shim
        alias: {
          '@base-org/account': false,
          '@web3-react/core': path.resolve(__dirname, 'src/web3-react-compat.ts'),
          'openapi-fetch': path.resolve(__dirname, 'src/openapi-fetch-shim.js'),
        },
        // Webpack 5 does not resolve node modules, so we do so for those necessary:
        fallback: {
          // - react-markdown requires path
          path: require.resolve('path-browserify'),
          // Some packages (cosmiconfig, resolve, etc.) require Node core modules in the browser build.
          // - provide browser polyfills where appropriate (if available)
          os: osBrowser || false,
          crypto: cryptoBrowser || false,
          // - treat fs/module as unavailable in the browser
          fs: false,
          module: false,
        },
      })

      // Retain source maps for node_modules packages:
      // Commented out because it breaks CSS loading from node_modules
      // webpackConfig.module.rules[0] = {
      //   ...webpackConfig.module.rules[0],
      //   exclude: /node_modules/,
      // }

      // Configure webpack transpilation (create-react-app specifies transpilation rules in a oneOf):
      const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf)
      if (oneOfRule && oneOfRule.oneOf) {
        oneOfRule.oneOf = oneOfRule.oneOf.map((rule) => {
          // Disable source-map-loader for @reown packages (they have broken source maps)
          if (rule.enforce === 'pre' && rule.loader && rule.loader.includes('source-map-loader')) {
            return {
              ...rule,
              exclude: [...(rule.exclude instanceof RegExp ? [rule.exclude] : rule.exclude || []), /node_modules\/@reown/],
            }
          }
          if (rule.loader && rule.loader.match(/babel-loader/)) {
            rule.loader = 'swc-loader'
            rule.options = {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  dynamicImport: true,
                  importAssertions: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
                target: 'es2022',
                experimental: {
                  plugins: [['@lingui/swc-plugin', {}]],
                },
              },
            }
          }
          return rule
        })
      }

      // Run terser compression on node_modules before tree-shaking, so that tree-shaking is more effective.
      // This works by eliminating dead code, so that webpack can identify unused imports and tree-shake them;
      // it is only necessary for node_modules - it is done through linting for our own source code -
      // see https://medium.com/engineering-housing/dead-code-elimination-and-tree-shaking-at-housing-part-1-307a94b30f23#7e03:
      webpackConfig.module.rules.push({
        enforce: 'post',
        test: /node_modules.*\.(js)$/,
        loader: path.join(__dirname, 'scripts/terser-loader.js'),
        options: { compress: true, mangle: false },
      })

      // Configure webpack optimization:
      webpackConfig.optimization = Object.assign(
        webpackConfig.optimization,
        isProduction
          ? {
              splitChunks: {
                // Cap the chunk size to 5MB.
                // react-scripts suggests a chunk size under 1MB after gzip, but we can only measure maxSize before gzip.
                // react-scripts also caps cacheable chunks at 5MB, which gzips to below 1MB, so we cap chunk size there.
                // See https://github.com/facebook/create-react-app/blob/d960b9e/packages/react-scripts/config/webpack.config.js#L713-L716.
                maxSize: 5 * 1024 * 1024,
                // Optimize over all chunks, instead of async chunks (the default), so that initial chunks are also optimized.
                chunks: 'all',
              },
            }
          : {}
      )

      // Configure webpack resolution. webpackConfig.cache is unused with swc-loader, but the resolver can still cache:
      webpackConfig.resolve = Object.assign(webpackConfig.resolve, { unsafeCache: true })

      return webpackConfig
    },
  },
}
