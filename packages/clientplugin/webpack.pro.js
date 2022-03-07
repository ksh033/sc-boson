const path = require('path');
const common = require('./webpack.cfg');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = merge(common, {
  entry: {
    app: './src/index.ts',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    // 组件采用UMD格式打包
    libraryTarget: 'umd',
    // 组件名称
    library: 'ClientPlugin',
  },
  devtool: 'source-map',
  mode: 'production',
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
    }),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  ],
});
