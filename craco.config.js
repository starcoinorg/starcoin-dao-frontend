const webpack = require('webpack');
const path = require('path');
const express = require('express');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

const buildPluginCopyPatterns = function() {
  let patterns = [];

  const files = fs.readdirSync(path.resolve(__dirname, 'plugins'));

  files.forEach(plugin_name => {
    patterns.push({
      from: 'plugins/' + plugin_name + '/dist',
      to: path.resolve(__dirname, 'build/plugins/' + plugin_name),
    });
  });

  return patterns;
};

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          stream: require.resolve('stream-browserify'),
          os: require.resolve('os-browserify/browser'),
          zlib: require.resolve('browserify-zlib'),
          process: require.resolve('process/browser'),
        },
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false, // disable the behaviour
            },
          },
          {
            test: /\.m?js$/,
            enforce: 'pre',
            use: [
              {
                loader: 'source-map-loader',
                options: {
                  filterSourceMappingUrl: (url, resourcePath) => {
                    if (/broker-source-map-url\.js$/i.test(url)) {
                      return false;
                    }

                    if (/keep-source-mapping-url\.js$/i.test(resourcePath)) {
                      return 'skip';
                    }

                    return true;
                  },
                },
              },
            ],
          },
        ],
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
        new CopyPlugin({
          patterns: buildPluginCopyPatterns(),
        }),
      ],
    },
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
      },
    ],

    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // config plugins router
      try {
        const files = fs.readdirSync(path.resolve(__dirname, 'plugins'));

        files.forEach(plugin_name => {
          devServer.app.use(
            '/plugins/' + plugin_name,
            express.static(
              path.resolve(__dirname, 'plugins/' + plugin_name + '/dist'),
            ),
          );
        });
      } catch (err) {
        console.log(err);
      }

      return middlewares;
    },
  },
};
