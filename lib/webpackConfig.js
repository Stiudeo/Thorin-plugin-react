'use strict';
const path = require('path'),
  fs = require('fs');
/**
 * Created by Adrian on 19-Apr-16.
 */
module.exports = function(thorin, opt) {
  let content,
    logger = thorin.logger(opt.logger);
  try {
    content = fs.readFileSync(__dirname + '/base.webpack.js', { encoding: 'utf8' });
  } catch(e) {
    logger.error('Failed to read base webpack config file', e);
    return null;
  }
  const $ENTRY_PATH = '.' + path.normalize(opt.sourcePath + '/' + opt.library).replace(/\\/g,'/'),
    $PUBLIC_PATH = opt.publicBuild,
    $SOURCE_PATH = opt.sourcePath,
    $DEV_SERVER = "http://localhost:" + opt.devPort,
    $LIBRARY = opt.library,
    $FILE_NAME = opt.libraryName;

  content = content.replace(/\$ENTRY_PATH/g, $ENTRY_PATH);
  content = content.replace(/\$PUBLIC_PATH/g, $PUBLIC_PATH);
  content = content.replace(/\$SOURCE_PATH/g, $SOURCE_PATH);
  content = content.replace(/\$DEV_SERVER/g, $DEV_SERVER);
  content = content.replace(/\$LIBRARY/g, $LIBRARY);
  content = content.replace(/\$FILE_NAME/g, $FILE_NAME);
  return content;
};