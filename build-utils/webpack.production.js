const fs = require("fs")
const resolve = require("resolve")
const Webpack = require("webpack")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const Dotenv = require("dotenv-webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const ManifestPlugin = require("webpack-manifest-plugin")
const WorkboxWebpackPlugin = require("workbox-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false"
const safePostCssParser = require("postcss-safe-parser")
const paths = require("./paths")
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin-alt")
const typescriptFormatter = require("react-dev-utils/typescriptFormatter")
const regexps = require("./regexp-collection")
const useTypeScript = fs.existsSync(paths.appTsConfig)

process.env.BABEL_ENV = "production"
process.env.NODE_ENV = "production"
require("./env")

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = paths.publicPath === "./"

const getStyleLoadersProd = (cssOptions, preProcessor) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: Object.assign(
        {},
        shouldUseRelativeAssetPaths ? { publicPath: "../../" } : undefined
      ),
    },
    {
      loader: require.resolve("css-loader"),
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: require.resolve("postcss-loader"),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebook/create-react-app/issues/2677
        ident: "postcss",
        plugins: () => [
          require("postcss-flexbugs-fixes"),
          require("postcss-preset-env")({
            autoprefixer: {
              flexbox: "no-2009",
            },
            stage: 3,
          }),
        ],
        sourceMap: shouldUseSourceMap,
      },
    },
  ]
  if (preProcessor) {
    loaders.push({
      loader: require.resolve(preProcessor),
      options: {
        sourceMap: shouldUseSourceMap,
      },
    })
  }
  return loaders
}

const minimizer = [
  new TerserPlugin({
    terserOptions: {
      parse: {
        // we want terser to parse ecma 8 code. However, we don't want it
        // to apply any minfication steps that turns valid ecma 5 code
        // into invalid ecma 5 code. This is why the 'compress' and 'output'
        // sections only apply transformations that are ecma 5 safe
        // https://github.com/facebook/create-react-app/pull/4234
        ecma: 8,
      },
      compress: {
        ecma: 5,
        warnings: false,
        // Disabled because of an issue with Uglify breaking seemingly valid code:
        // https://github.com/facebook/create-react-app/issues/2376
        // Pending further investigation:
        // https://github.com/mishoo/UglifyJS2/issues/2011
        comparisons: false,
        // Disabled because of an issue with Terser breaking valid code:
        // https://github.com/facebook/create-react-app/issues/5250
        // Pending futher investigation:
        // https://github.com/terser-js/terser/issues/120
        inline: 2,
      },
      mangle: {
        safari10: true,
      },
      output: {
        ecma: 5,
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebook/create-react-app/issues/2488
        ascii_only: true,
      },
    },
    // Use multi-process parallel running to improve the build speed
    // Default number of concurrent runs: os.cpus().length - 1
    parallel: true,
    // Enable file caching
    cache: true,
    sourceMap: shouldUseSourceMap,
  }),
  new OptimizeCSSAssetsPlugin({
    cssProcessorOptions: {
      parser: safePostCssParser,
      map: shouldUseSourceMap
        ? {
            // `inline: false` forces the sourcemap to be output into a
            // separate file
            inline: false,
            // `annotation: true` appends the sourceMappingURL to the end of
            // the css file, helping the browser find the sourcemap
            annotation: true,
          }
        : false,
    },
  }),
]
const styleLoaders = [
  // "postcss" loader applies autoprefixer to our CSS.
  // "css" loader resolves paths in CSS and adds assets as dependencies.
  // `MiniCSSExtractPlugin` extracts styles into CSS
  // files. If you use code splitting, async bundles will have their own separate CSS chunk file.
  // By default we support CSS Modules with the extension .module.css
  {
    test: regexps.css,
    exclude: regexps.cssModule,
    loader: getStyleLoadersProd({
      importLoaders: 1,
      sourceMap: shouldUseSourceMap,
    }),
    // Don't consider CSS imports dead code even if the
    // containing package claims to have no side effects.
    // Remove this when webpack adds a warning or an error for this.
    // See https://github.com/webpack/webpack/issues/6571
    sideEffects: true,
  },
  // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
  // using the extension .module.css
  {
    test: regexps.cssModule,
    loader: getStyleLoadersProd({
      importLoaders: 1,
      sourceMap: shouldUseSourceMap,
      modules: true,
      getLocalIdent: getCSSModuleLocalIdent,
    }),
  },
  // Opt-in support for SASS. The logic here is somewhat similar
  // as in the CSS routine, except that "sass-loader" runs first
  // to compile SASS files into CSS.
  // By default we support SASS Modules with the
  // extensions .module.scss or .module.sass
  {
    test: regexps.sass,
    exclude: regexps.sassModule,
    loader: getStyleLoadersProd(
      {
        importLoaders: 2,
        sourceMap: shouldUseSourceMap,
      },
      "sass-loader"
    ),
    // Don't consider CSS imports dead code even if the
    // containing package claims to have no side effects.
    // Remove this when webpack adds a warning or an error for this.
    // See https://github.com/webpack/webpack/issues/6571
    sideEffects: true,
  },
  // Adds support for CSS Modules, but using SASS
  // using the extension .module.scss or .module.sass
  {
    test: regexps.sassModule,
    loader: getStyleLoadersProd(
      {
        importLoaders: 2,
        sourceMap: shouldUseSourceMap,
        modules: true,
        getLocalIdent: getCSSModuleLocalIdent,
      },
      "sass-loader"
    ),
  },
]

const rules = [
  { parser: { requireEnsure: false } },
  {
    oneOf: [
      // Process application JS with Babel.
      // The preset includes JSX, Flow, and some ESnext features.
      {
        test: regexps.jsJsxTsTsx,
        include: paths.appSrc,
        loader: require.resolve("babel-loader"),
        options: {
          customize: require.resolve(
            "babel-preset-react-app/webpack-overrides"
          ),

          plugins: [
            [
              require.resolve("babel-plugin-named-asset-import"),
              {
                loaderMap: {
                  svg: {
                    ReactComponent: "@svgr/webpack?-prettier,-svgo![path]",
                  },
                },
              },
            ],
          ],
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
          // Don't waste time on Gzipping the cache
          cacheCompression: false,
        },
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
      },
      // Process any JS outside of the app with Babel.
      // Unlike the application JS, we only compile the standard ES features.
      {
        test: regexps.js,
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        loader: require.resolve("babel-loader"),
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          presets: [
            [
              require.resolve("babel-preset-react-app/dependencies"),
              { helpers: true },
            ],
          ],
          cacheDirectory: true,
          // Don't waste time on Gzipping the cache
          cacheCompression: false,

          // If an error happens in a package, it's possible to be
          // because it was compiled. Thus, we don't want the browser
          // debugger to show the original code. Instead, the code
          // being evaluated would be much more helpful.
          sourceMaps: false,
        },
      },
      ...styleLoaders,
      {
        test: regexps.fontsAndSvg,
        include: [paths.appAssets, /node_modules/],
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[hash].[ext]",
            },
          },
        ],
      },
      {
        test: regexps.images,
        include: [paths.appSrc, paths.appAssets],
        use: [
          {
            loader: "file-loader",
            options: {
              name: "./images/[name].[hash].[ext]",
            },
          },
        ],
      },
      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      // This loader doesn't use a "test" so it will catch all modules
      // that fall through the other loaders.
      {
        // Exclude `js` files to keep "css" loader working as it injects
        // its runtime that would otherwise processed through "file" loader.
        // Also exclude `html` and `json` extensions so they get processed
        // by webpacks internal loaders.
        exclude: [regexps.jsAndJsx, regexps.html, regexps.json],
        loader: require.resolve("file-loader"),
        options: {
          name: "static/media/[name].[hash:8].[ext]",
        },
      },
    ],
  },
]

module.exports = () => ({
  output: {
    filename: "bundle.js",
  },
  devtool: "none",
  optimization: {
    minimizer,
  },
  module: {
    rules,
  },
  performance: {
    hints: "warning",
  },
  plugins: [
    new Dotenv({
      path: "./.env.production",
      safe: false,
    }),
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      hash: true,
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    // new ExtractTextPlugin("[name].css"),
    new ModuleNotFoundPlugin(paths.appPath),
    new Webpack.DefinePlugin("{ NODE_ENV: 'production'}"),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "static/css/[name].[contenthash:8].css",
      chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
    }),
    new ManifestPlugin({
      fileName: "asset-manifest.json",
      publicPath: paths.publicPath,
    }),
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      exclude: [/\.map$/, /asset-manifest\.json$/],
      importWorkboxFrom: "cdn",
      navigateFallback: paths.publicUrl + "/index.html",
      navigateFallbackBlacklist: [
        // Exclude URLs starting with /_, as they're likely an API call
        new RegExp("^/_"),
        // Exclude URLs containing a dot, as they're likely a resource in
        // public/ and not a SPA route
        new RegExp("/[^/]+\\.[^/]+$"),
      ],
    }),
    new CopyWebpackPlugin([{ from: "../assets", to: "../build/assets" }]),
    // TypeScript type checking
    useTypeScript &&
      new ForkTsCheckerWebpackPlugin({
        typescript: resolve.sync("typescript", {
          basedir: paths.appNodeModules,
        }),
        async: false,
        checkSyntacticErrors: true,
        tsconfig: paths.appTsConfig,
        compilerOptions: {
          module: "esnext",
          moduleResolution: "node",
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "preserve",
        },
        reportFiles: [
          "**",
          "!**/*.json",
          "!**/__tests__/**",
          "!**/?(*.)(spec|test).*",
          "!src/setupProxy.js",
          "!src/setupTests.*",
        ],
        watch: paths.appSrc,
        silent: true,
        formatter: typescriptFormatter,
      }),
  ].filter(Boolean),
  devServer: {
    hot: false,
  },
})
