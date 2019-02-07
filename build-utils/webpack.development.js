const fs = require("fs")
const paths = require("./paths")
const resolve = require("resolve")
const Webpack = require("webpack")
const Dotenv = require("dotenv-webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
// const ExtractTextPlugin       = require("extract-text-webpack-plugin")
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin-alt")
const typescriptFormatter = require("react-dev-utils/typescriptFormatter")
const regexps = require("./regexp-collection")

process.env.BABEL_ENV = "development"
process.env.NODE_ENV = "development"
require("./env")

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig)

const getStyleLoadersDev = (cssOptions, preProcessor) => {
  const loaders = [
    require.resolve("style-loader"),
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
      },
    },
  ]
  if (preProcessor) {
    loaders.push(require.resolve(preProcessor))
  }
  return loaders
}
const styleLoaders = [
  // "postcss" loader applies autoprefixer to our CSS.
  // "css" loader resolves paths in CSS and adds assets as dependencies.
  // "style" loader turns CSS into JS modules that inject <style> tags.
  // In production, we use a plugin to extract that CSS to a file, but
  // in development "style" loader enables hot editing of CSS.
  // By default we support CSS Modules with the extension .module.css
  {
    test: regexps.css,
    exclude: regexps.cssModule,
    use: getStyleLoadersDev({
      importLoaders: 1,
    }),
  },
  // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
  // using the extension .module.css
  {
    test: regexps.cssModule,
    use: getStyleLoadersDev({
      importLoaders: 1,
      modules: true,
      getLocalIdent: getCSSModuleLocalIdent,
    }),
  },
  // Opt-in support for SASS (using .scss or .sass extensions).
  // Chains the sass-loader with the css-loader and the style-loader
  // to immediately apply all styles to the DOM.
  // By default we support SASS Modules with the
  // extensions .module.scss or .module.sass
  {
    test: regexps.sass,
    exclude: regexps.sassModule,
    use: getStyleLoadersDev({ importLoaders: 2 }, "sass-loader"),
  },
  // Adds support for CSS Modules, but using SASS
  // using the extension .module.scss or .module.sass
  {
    test: regexps.sassModule,
    use: getStyleLoadersDev(
      {
        importLoaders: 2,
        modules: true,
        getLocalIdent: getCSSModuleLocalIdent,
      },
      "sass-loader"
    ),
  },
  /*      {
   test: /\.s?css$/,
   include: [paths.appSrc],
   use: styleUse
   },
   {
   test: /\.scss$/,
   include: [paths.appAssets],
   use: styleUse
   },*/
]
const rules = [
  { parser: { requireEnsure: false } },
  {
    test: regexps.jsJsxTsTsx,
    enforce: "pre",
    use: [
      {
        options: {
          formatter: require.resolve("react-dev-utils/eslintFormatter"),
          eslintPath: require.resolve("eslint"),
        },
        loader: require.resolve("eslint-loader"),
      },
    ],
    include: paths.appSrc,
  },
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
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    compress: true,
    port: process.env.PORT || 3000,
    hot: true,
    stats: {
      children: false,
    },
  },
  devtool: "cheap-module-eval-source-map",
  module: {
    rules,
  },
  plugins: [
    new Dotenv({
      path: "./.env.development",
      safe: false,
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
      hash: true,
    }),
    // new ExtractTextPlugin("[name].css"),
    new Webpack.HotModuleReplacementPlugin(),
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
})
