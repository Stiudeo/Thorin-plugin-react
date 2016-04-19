'use strict';
const path = require('path'),
  fs = require('fs'),
  getWebpackConfig = require('./webpackConfig');
/**
 * Created by Adrian on 19-Apr-16.
 */
module.exports = function(thorin, opt) {
  const logger = thorin.logger(opt.logger);

  const STRUCTURE = [
    opt.sourcePath,
    opt.publicBuild,
    opt.libPath
  ];

  /* Creates the .babelrc file from a template. */
  function createBabel(done) {
    if(thorin.util.isFile(thorin.root + '/.babelrc')) {
      return done();
    }
    const BABELRC_CONFIG = {
      presets: ['es2015', 'react']
    }
    fs.writeFile(thorin.root + '/.babelrc', JSON.stringify(BABELRC_CONFIG, null, 1), { encoding: 'utf8' }, (e) => {
      if(e) return done(thorin.error('BABEL_SETUP', 'Failed to setup babelrc file', e));
      done();
    });
  }

  /* Create the webpack config */
  function createWebpack(done) {
    if(thorin.util.isFile(thorin.root + '/' + opt.webpackFile)) return done();
    const webpackConfig = getWebpackConfig(thorin, opt);
    fs.writeFile(thorin.root + "/" + opt.webpackFile, webpackConfig, { encoding: 'utf8' }, (e) => {
      if(e) return thorin.error('WEBPACK_SETUP', 'Failed to create webpack config file', e);
      done();
    });
  }

  return function doSetup(done) {
    let calls = [];

    /* Add gitignore for hot updates. */
    thorin.addIgnore('*.hot-update.js');
    thorin.addIgnore('*.hot-update.json');

    /* Create the folder structure */
    STRUCTURE.forEach((item) => {
      let fullPath = path.normalize(thorin.root + '/' + item);
      calls.push((done) => {
        thorin.util.fs.ensureDir(fullPath, done);
      });
    });

    /* Check for babelrc */
    calls.push(createBabel);

    /* check for webpack.config.js and create it if not */
    calls.push(createWebpack);


    /* ensure main.js if no file is found under react/*/
    calls.push((done) => {
      let jsFiles = thorin.util.readDirectory(thorin.root + '/react');
      if(jsFiles.length !== 0) return done();
      fs.writeFile(thorin.root + '/react/main.js', '"use strict";\n', (e) => {
        if(e) {
          return done(thorin.error('JS_FAIL', 'Failed to setup main.js react file', e));
        }
        done();
      });
    });

    /* Copy the react production and react development files. */
    calls.push((done) => {
      let targetDist = path.normalize(thorin.root + '/' + opt.libPath + '/react.min.js'),
        targetDevDist = path.normalize(thorin.root + '/' + opt.libPath + '/react.js');
      thorin.util.fs.copy(path.normalize(__dirname+ '/build/react.development.js'), targetDevDist, (e) => {
        if(e) return done(thorin.error('PREPARE_FAILED', 'Failed to copy react dev bundle.', e));
        thorin.util.fs.copy(path.normalize(__dirname + '/build/react.production.js'), targetDist, (e) => {
          if(e) return done(thorin.error('PREPARE_FAILED', 'Failed to copy react prod bundle', e));
          done();
        });
      });
    });

    thorin.util.async.series(calls, (e) => {
      if(e) {
        logger.error('Failed to setup the react plugin.');
      }
      return done(e);
    });
  }
}