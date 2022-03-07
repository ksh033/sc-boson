const path = require('path');
const webpack = require('webpack');
const common = require('./webpack.cfg');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyeWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'development', //production
  devServer: {
    useLocalIp: true,
    host: '0.0.0.0',
    contentBase: [path.join(__dirname, 'tmp'), path.join(__dirname, 'asset')],
    hot: true,
  },
  devtool: 'source-map',
  entry: './src/demo.ts',
  output: {
    filename: 'demo.js',
    path: path.resolve(__dirname, 'demo'),
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.join(__dirname, 'tmp')],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'asset', 'index.ejs'),
    }),
    new CopyeWebpackPlugin([
      {
        from: 'asset/template',
        to: path.join(__dirname, 'demo\\template'),
      },
    ]),
  ],
});
