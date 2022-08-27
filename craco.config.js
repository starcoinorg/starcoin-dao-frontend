const webpack = require('webpack');

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
            enforce: "pre",
            use: [
              {
                loader: "source-map-loader",
                options: {
                  filterSourceMappingUrl: (url, resourcePath) => {
                    if (/broker-source-map-url\.js$/i.test(url)) {
                      return false;
                    }
    
                    if (/keep-source-mapping-url\.js$/i.test(resourcePath)) {
                      return "skip";
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
      ],
    },
  },
};
