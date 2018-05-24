const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const version = require('./package.json').version;
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');
// sw-precache-webpack-plugin configurations
const SERVICE_WORKER_FILENAME = 'atfcapi-service-worker.js';
const SERVICE_WORKER_CACHEID = 'atfcapi-project-name';
const SERVICE_WORKER_IGNORE_PATTERNS = [/dist\/.*\.html/];
const SW_PRECACHE_CONFIG = {
  cacheId: SERVICE_WORKER_CACHEID,
  filename: SERVICE_WORKER_FILENAME,
  staticFileGlobsIgnorePatterns: SERVICE_WORKER_IGNORE_PATTERNS
};

const plugins = [
  new ExtractTextPlugin('css-' + version + '.css'),
  new HtmlWebpackPlugin({
    template: './index.html',
    serviceWorker: `/${SERVICE_WORKER_FILENAME}`
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor'
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false
  }),
  new BabiliPlugin(),
  new SWPrecacheWebpackPlugin(SW_PRECACHE_CONFIG)
];

module.exports = {
  entry: {
    index: './app/index.js',
    vendor: ['react', 'react-dom', 'react-router', 'moment']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    alias: {
      atfcapi: path.resolve(__dirname, './app/components')
    },
    // treeshaking
    mainFields: ['jsnext:main', 'main']
  },
  devtool: 'source-map',
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.(ttf|eot|svg|woff|woff2)(\?.+)?$/,
        loader: 'file-loader?name=[name].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif)(\?.+)?$/,
        loader: 'url?name=[hash:12].[ext]&limit=25000'
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader?cacheDirectory',
        exclude: /(node_modules)/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader?minimize', 'sass-loader'],
          fallback: 'style-loader'
        })
      }
    ]
  }
};
