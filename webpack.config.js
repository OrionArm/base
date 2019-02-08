// const autoprefixer           = require("autoprefixer")
const webpackMerge = require("webpack-merge")
const presetConfig = require("./build-utils/loadPresets")
const paths = require("./build-utils/paths")

const modeConfig = env => require(`./build-utils/webpack.${env}`)(env)
const config = mode => ({
  mode,
  stats: {
    children: false,
  },
  target: "web",
  // The base directory, an absolute path,
  // for resolving entry points and loaders from configuration.
  context: paths.appSrc,
  entry: {
    main: [paths.appIndexJs],
  },
  output: {
    // the target directory for all output files
    // must be an absolute path (use the Node.js path module)
    path: paths.appBuild,
    // the url to the output directory resolved relative to the HTML page
    publicPath: "/",
    filename: "[name].js",
    chunkFilename: "lazy_[name].[chunkhash].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: ["node_modules", paths.appSrc],
  },
  module: {
    strictExportPresence: true,
  },
  optimization: {
    // Automatically split vendor and commons
    // https://twitter.com/wSokra/status/969633336732905474
    // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
    // Automatically split vendor and commons
    // https://twitter.com/wSokra/status/969633336732905474
    // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
    usedExports: true,
    splitChunks: {
      chunks: "all",
    },
    // Keep the runtime chunk seperated to enable long term caching
    // https://twitter.com/wSokra/status/969679223278505985
    runtimeChunk: true,
  },
  node: {
    fs: "empty",
    net: "empty",
  },
})

module.exports = (
  { mode, presets } = {
    mode: "production",
    presets: [],
  }
) => {
  console.log("Start", mode)
  const configurate = config(mode)
  return webpackMerge(
    configurate,
    modeConfig(mode),
    presetConfig({ mode, presets })
  )
}
