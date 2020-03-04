const path = require('path');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const Merge = require('webpack-merge');

module.exports = env => (Merge.multiple(common(env), {
  js: {
    mode: 'development',
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
    devtool: 'inline-source-map',
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
      new HtmlWebpackPlugin({
        title: '[kunai-testing-2]',
        hash: true,
        filename: 'kunai-testing-2.html',
        template: '../html/kunai-testing-2.hbs',
        chunks: [
          'kunai-vendor',
          'kunai',
          'browser',
        ],
      }),
      new HtmlWebpackPlugin({
        title: '[char16_32]',
        hash: true,
        filename: 'char16_32.html',
        template: '../html/char16_32.hbs',
        chunks: [
          'kunai-vendor',
          'kunai',
          'browser',
        ],
      }),
      new HtmlWebpackTagsPlugin({
        tags: [
          'css/kunai-stage-0.css',
          'css/kunai-stage-1.css',
          'css/kunai-stage-2.css',
          'css/kunai-stage-3.css',
          'css/browser.css',
        ],
        append: true,
        useHash: true,
      }),
    ],
  },
  css: {
    mode: 'development',
    entry: {
      browser: './browser.css',
    },
    devtool: 'inline-source-map',
  },
}))

