const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      config: path.resolve(__dirname, 'src/config/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      plugins: path.resolve(__dirname, 'src/plugins/'),
      socket: path.resolve(__dirname, 'src/socket/'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['dist'],
    }),
  ],
};
