const common = require('./webpack.common.js');
const webpack = require('webpack');
const Merge = require('webpack-merge');

module.exports = env => (Merge.multiple(common(env), {
  js: {
    plugins: [
      new CleanWebpackPlugin(
        ['dist'], { verbose: true, }
      ),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
    ],
  },
}))

