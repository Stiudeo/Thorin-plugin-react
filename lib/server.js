'use strict';
/**
 * Created by Adrian on 19-Apr-16.
 */
const webpack = require('webpack'),
  path = require('path'),
  webpackDevServer = require('webpack-dev-server');
const webpackConfig = require(process.env.THORIN_WEBPACK_CONFIG),
  publicPath = process.env.THORIN_WEBPACK_PUBLIC,
  PORT = parseInt(process.env.THORIN_WEBPACK_PORT);
const serverObj = new webpackDevServer(webpack(webpackConfig), {
  publicPath: publicPath,
  hot: true,
  log: function() {},
  historyApiFallback: true
}).listen(PORT, 'localhost', function (err, result) {
  if (err) {
    console.error(err);
  }
  console.info("THORIN_STARTED");
});