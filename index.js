'use strict';
const path = require('path'),
  fs = require('fs'),
  initSetup = require('./lib/setup'),
  initServer = require('./lib/webpackServer'),
  initCompiler = require('./lib/webpackCompiler');
/**
 * Created by Adrian on 08-Apr-16.
 *
 * The less plugin is a utility plugin that will watch the given less input for changes and compile it into css.
 */
module.exports = function(thorin, opt, pluginName) {
  opt = thorin.util.extend({
    logger: pluginName || 'react',
    webpackFile: 'webpack.config.js',  // the webpack.config.js file that we're gonna generate
    watch: thorin.env === 'development',
    debug: true,
    publicBuild: '/public/js/build',
    libPath: 'public/js/lib',
    sourcePath: '/react',
    library: 'main',
    libraryName: null,
    hotReload: (thorin.env === 'development'),
    devPort: 12010
  }, opt);
  if(!opt.libraryName) {
    opt.libraryName = opt.library + '.js'
  }
  const pluginObj = {};
  let isSetup = false;
  /* Setup the react app structure. */
  pluginObj.setup = function(done) {
    isSetup = true;
    initSetup(thorin, opt)(done);
  }
  /* Clean the build path from any hot reload files. */
  pluginObj.init = function() {
    let buildFiles = thorin.util.readDirectory(thorin.root + opt.publicBuild);
    buildFiles.forEach((item) => {
      if(item.indexOf('.hot-update.') === -1) return;
      try {
        fs.unlinkSync(item);
      } catch(e) {}
    });
  }
  /* Initialize the webpack compiler */
  pluginObj.run = function(done) {
    let calls = [];
    /* IF we're in dev, enable the dev server */
    if(opt.hotReload && !isSetup) {
      calls.push(initServer(thorin, opt));
    }
    /* if not, we're starting the webpack compiler */
    calls.push(initCompiler(thorin, opt));
    thorin.util.async.series(calls, done);
  }

  return pluginObj;
};