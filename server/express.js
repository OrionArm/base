const express = require("express")
const expressStaticGzip = require("express-static-gzip")

const server = express()
// import path from "path"

const isProd = process.env.NODE_ENV === "production"
if (!isProd) {
  const webpack = require("webpack")
  const configFromCLI = {
    mode: "development",
    presets: [],
  }
  const config = require("../webpack.config")(configFromCLI)
  const compiler = webpack(config)

  const webpackDevMiddleware = require("webpack-dev-middleware")(
    compiler,
    config.devServer
  )

  const webpackHotMiddlware = require("webpack-hot-middleware")(
    compiler,
    config.devServer
  )

  server.use(webpackDevMiddleware)
  server.use(webpackHotMiddlware)
  console.log("Middleware enabled")
}

server.use(
  expressStaticGzip("dist", {
    enableBrotli: true,
  })
)

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(
    `Server listening on http://localhost:${PORT} in ${process.env.NODE_ENV}`
  )
})
