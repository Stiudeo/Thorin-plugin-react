var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: ['$ENTRY_PATH'],
  output: {
    path: path.normalize(__dirname + '$PUBLIC_PATH'),
    publicPath: 'js/build',
    library: "$LIBRARY",
    filename: "$FILE_NAME"
  },

  module: {
    loaders: [
      {
        test: /(\.jsx?$)/,
        exclude: /(node_modules)/,
        loaders: ['babel'],
        include: path.normalize(__dirname + '$SOURCE_PATH')
      }
    ]
  },
  plugins: [new webpack.DefinePlugin({
    'NODE_ENV': '"'+process.env.NODE_ENV+'"'
  })],
  resolve: {
    root: [
      path.normalize(__dirname + '$SOURCE_PATH')
    ],
    extensions: ['', '.js', '.jsx'],
    alias: {}
  },
  // In order for it to work, please require the react library.
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};

// If we're in development mode, add the webpack dev server files.
if(process.env.NODE_ENV !== 'production') {
  module.exports.entry.splice(0,0,'webpack/hot/dev-server');
  module.exports.entry.splice(0,0,'webpack-dev-server/client?$DEV_SERVER');
  module.exports.module.loaders[0].loaders.splice(0,0,'react-hot');
  module.exports.plugins.splice(0,0 ,new webpack.HotModuleReplacementPlugin());
} else {
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  }));
}