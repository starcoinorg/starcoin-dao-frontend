import { DefinePlugin, ProvidePlugin } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { getPublicPath, isDevelopment, getPort } from './util';
const appName = 'member_app';
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const webpackConfig = {
  devtool: 'source-map',
  entry: {
    main: './src/index.tsx',
  },
  output: {
    // 开发环境设置 true 将会导致热更新失效
    clean: isDevelopment ? false : true,
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    // webpack5 此参数不是必须，webpack5 将会直接使用 package.json name 作为唯一值，请确保应用间的 name 各不相同
    // 若为 webpack4，此处应将 chunkLoadingGlobal 改为 jsonpFunction, 并确保每个子应用该值都不相同，否则可能出现 webpack chunk 互相影响的可能
    chunkLoadingGlobal: 'Garfish-demo-react16',
    // 保证子应用的资源路径变为绝对路径，避免子应用的相对资源在变为主应用上的相对资源，因为子应用和主应用在同一个文档流，相对路径是相对于主应用而言的
    publicPath: getPublicPath(appName),
  },
  // externals: {
  //   react: 'react',
  //   "react-dom": "react-dom",
  //   "react-router-dom": "react-router-dom",
  //   "mobx-react": "mobx-react"
  // },
  // 避免 global 逃逸
  node: false,
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      os: require.resolve('os-browserify/browser'),
      zlib: require.resolve('browserify-zlib'),
      process: require.resolve('process/browser'),
      url: require.resolve('url-polyfill'),
      assert: require.resolve('assert-polyfill'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-typescript',
            '@babel/preset-react',
            '@babel/preset-env',
          ],
        },
      },
      {
        test: /\.css$|\.less$/,
        use: [
          {
            loader: 'style-loader', // creates style nodes from JS strings
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
          },
          {
            loader: 'less-loader',
            options: { javascriptEnabled: true },
          },
        ],
      },
      {
        test: /\.(svg|png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
      {
        test: /\.woff|woff2|eot|ttf$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    hot: true,
    // open: true,
    historyApiFallback: true,
    port: getPort(appName),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      global: {},
    }),
    new CopyPlugin({
      patterns: [{ from: 'public/dynamic.js', to: './' }],
    }),
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ].concat(isDevelopment ? [new ReactRefreshWebpackPlugin()] : []),
};

export default webpackConfig;
