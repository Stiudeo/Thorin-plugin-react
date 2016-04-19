'use strict';
const webpack = require('webpack'),
  path = require('path');
/**
 * Created by Adrian on 19-Apr-16.
 */
module.exports = function(thorin, opt) {
  let compilerObj,
    logger = thorin.logger(opt.logger);
  return function initCompiler(done) {
    const webpackConfig = require(thorin.root + '/' + opt.webpackFile);
    compilerObj = webpack(webpackConfig);
    let isDone = false;

    function onCompile(err, stats) {
      if (!isDone) {
        isDone = true;
        if (err) {
          return done(thorin.error('WEBPACK_COMPILE', 'Failed to compile build.', err));
        }
        let took = stats.endTime - stats.startTime;
        let output = path.normalize(opt.buildPath + '/' + opt.libraryName).replace(/\\/g,'/');
        if(output.charAt(0) === '/') output = output.substr(1);
        logger.trace('Compiled %s (took %s ms)', output, took);
        return done();
      }
      if (err) {
        logger.warn('Failed to compile react app', err);
        return;
      }
      let took = stats.endTime - stats.startTime;
      logger.trace('Compiled react app (took %s ms)', took);
    }
    logger.trace('Compiling react app');
    if (opt.watch) {
      compilerObj.watch({
        aggregateTimeout: 300
      }, onCompile);
    } else {
      compilerObj.run(onCompile);
    }
  }
};