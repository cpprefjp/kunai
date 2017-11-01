const path = require('path');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const Merge = require('webpack-merge');

module.exports = env => (Merge.multiple(common(env), {
  js: {
    entry: {
      browser: './browser.js',
    },
    module: {
      rules: [
        {
          test: /\.hbs$/,
          use: [
            {
              loader: 'handlebars-loader',
            },
          ],
        },
      ],
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
      publicPath: '/',
      contentBase: path.join(__dirname, 'example'),
      watchContentBase: true,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('development')
        }
      }),
      new HtmlWebpackPlugin({
        title: '[kunai-testing]',
        hash: true,
        template: '../html/kunai-testing.hbs',
        chunks: [
          'kunai-vendor',
          'kunai',
          'browser',
        ],
      }),
      // new HtmlWebpackIncludeAssetsPlugin({
        // assets: [
          // 'css/font-awesome.css',
          // 'css/bootstrap.css',
        // ],
        // append: false,
        // hash: true,
      // }),
      new HtmlWebpackIncludeAssetsPlugin({
        assets: [
          'css/kunai-stage-0.css',
          'css/kunai-stage-1.css',
          'css/kunai-stage-2.css',
          'css/kunai-stage-3.css',
          'css/browser.css',
        ],
        append: true,
        hash: true,
      }),
    ],
  },
  css: {
    entry: {
      browser: './browser.css',
    },
    devtool: 'cheap-module-eval-source-map',
  },
}))

