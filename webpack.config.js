const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { readdirSync, existsSync } = require('fs');

const tailPkgs = readdirSync(path.join(__dirname, 'packages')).filter(
  (pkg) => pkg.charAt(0) !== '.',
);

// const tailPkgs = ['table'];

const isCI = process.env.PRO_COMPONENTS_CI === 'CI';

const externals = isCI
  ? tailPkgs.reduce((pre, value) => {
      return {
        ...pre,
        [`@scboson/${value}`]: `${value
          .toLowerCase()
          .replace(/( |^)[a-z]/g, (L) => L.toUpperCase())}`,
      };
    }, {})
  : {};

const webPackConfigList = [];

const findEntry = (path) => {
  var indexFile = ['index.ts', 'index.js', 'index.tsx'];
  let file = indexFile.find((filename) => {
    return existsSync(path + filename);
  });
  return file;
};
tailPkgs.forEach((pkg) => {
  const entry = {};
  let entryFile = findEntry(`./packages/${pkg}/src/`);

  entry[`${pkg}`] = `./packages/${pkg}/src/${entryFile}`;
  if (!isCI) {
    entry[`${pkg}.min`] = `./packages/${pkg}/src/${entryFile}`;
  }
  const config = {
    entry,
    output: {
      filename: '[name].js',
      library: `${pkg.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())}`,
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'packages', pkg, 'dist'),
      globalObject: 'this',
    },
    mode: 'production',
    resolve: {
      extensions: ['.ts', '.tsx', '.json', '.css', '.js', '.less'],
    },
    optimization: isCI
      ? {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              include: /\.min\.js$/,
            }),
            new CssMinimizerPlugin({
              include: /\.min\.js$/,
            }),
          ],
        }
      : { concatenateModules: false },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|svg)$/i,
          type: 'asset',
        },
        {
          test: /\.jsx?$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/typescript', '@babel/env', '@babel/react'],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                '@babel/proposal-object-rest-spread',
                require('./scripts/replaceLib'),
              ],
            },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/typescript',
                [
                  '@babel/env',
                  {
                    loose: true,
                    modules: false,
                  },
                ],
                '@babel/react',
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                '@babel/proposal-object-rest-spread',
                require('./scripts/replaceLib'),
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader', // creates style nodes from JS strings
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: (resourcePath, context) =>
                  `${path.relative(path.dirname(resourcePath), context)}/`,
              },
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
      ],
    },
    externals: [
      {
        react: 'React',
        'react-dom': 'ReactDOM',
        antd: 'antd',
        moment: 'moment',
        net: 'net',
        ...externals,
      },
    ],
    plugins: [
      new ProgressBarPlugin(),
      // new BundleAnalyzerPlugin(),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
    ],
  };
  webPackConfigList.push(config);
});

module.exports = webPackConfigList;
