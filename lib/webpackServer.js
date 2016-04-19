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
    const procObj = spawn('node', [serverPath], opts);

    procObj.on('close', () => {
      logger.error('Webpack dev server was terminated.');
    });

    procObj.stdout.on('data', (d) => {
      d = d.toString();
      d = d.replace(/\n+/g, '\n');
      if(d.indexOf('THORIN_STARTED') !== -1 && !isStarted) {
        isStarted = true;
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