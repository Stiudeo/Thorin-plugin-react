'use strict';
const path = require('path'),
  spawn = require('child_process').spawn;
/**
 * Created by Adrian on 19-Apr-16.
 */
module.exports = function(thorin, opt) {
  let serverObj,
    logger = thorin.logger(opt.logger);
  return function initServer(done) {
    let publicPath = opt.buildPath,
      isStarted = false;
    publicPath = publicPath.replace('/public', '');
    const opts = {
      cwd: thorin.root,
      env: thorin.util.extend({
        THORIN_WEBPACK_CONFIG: path.normalize(thorin.root + '/' + opt.webpackFile),
        THORIN_WEBPACK_PUBLIC: publicPath,
        THORIN_WEBPACK_PORT: opt.devPort
      }, process.env)
    };
    let serverPath = path.normalize(__dirname + '/server.js');
    logger.trace('Compiling react app');
    const procObj = spawn('node', [serverPath], opts);

    procObj.on('close', () => {
      logger.error('Webpack dev server was terminated.');
    });
    let wasServerStarted = false,
      startAt = Date.now();
    procObj.stdout.on('data', (d) => {
      d = d.toString();
      d = d.replace(/\n+/g, '\n');
      let wIdx = d.indexOf('WARNING in');
      if(wIdx !== -1) {
        let warnMsg = d.substr(wIdx);
        logger.warn(warnMsg);
      }
      if(!wasServerStarted && d.indexOf('THORIN_STARTED') !== -1) {
        wasServerStarted = true;
      }
      if(!isStarted && wasServerStarted && d.indexOf('bundle is now') !== -1) {
        isStarted = true;
        let took = startAt - Date.now();
        let output = path.normalize(opt.buildPath + '/' + opt.libraryName).replace(/\\/g,'/');
        if(output.charAt(0) === '/') output = output.substr(1);
        logger.trace('Compiled %s (took %s ms)', output, took);
        return done();
      }
      let tmp = d.split('\n');
      if(tmp[tmp.length-1] == '') tmp.pop();
      d = tmp.pop();
      if(d.indexOf('bundle is now VALID') !== -1) {
        logger.debug(d);
      } else if(d.indexOf('bundle is now INVALID') !== -1) {
        logger.debug(d);
      }
    });
    procObj.stderr.on('data', (d) => {
      d = d.toString();
      d = d.replace(/\n+/g, '\n');
      logger.error(d.toString());
    });
  }
};