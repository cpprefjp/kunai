const common = require('./webpack.common.js');
const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const Merge = require('webpack-merge');


module.exports = env => (Merge.multiple(common(env), {
  js: {
    mode: 'production',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
    ],
  },
  css: {
    mode: 'production',
    plugins: [
      new OptimizeCSSAssetsPlugin({
        canPrint: true,
        cssProcessorOptions: {
          // http://cssnano.co/optimisations/reduceidents/
          reduceIdents: false,
        },
      }),
    ],
  },
}))

