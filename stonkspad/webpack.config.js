const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
// const dotenv = require("dotenv");
const Dotenv = require("dotenv-webpack");

module.exports = function (_env, argv) {
  const isProduction = argv.mode === "production";
  const sourceMapEnable =
    _env.APP_ENV === "dev" || _env.APP_ENV === "qa" || _env.APP_ENV === "qa2";
  const isProductionApp = _env.APP_ENV === "prod";

  console.log("env are", _env);

  return {
    mode: isProduction ? "production" : "development",
    devtool: isProductionApp || sourceMapEnable ? "source-map" : false,
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "assets/js/[name].[contenthash:8].js",
      chunkFilename: "assets/js/[name].[contenthash:8].chunk.js",
      publicPath: "/",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: isProduction ? "production" : "development",
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  auto: false,
                },
              },
            },
          ],
        },
        {
          test: /\.(png|jp(e*)g|svg|gif)$/,
          include: path.join(__dirname, "public/img"),
          type: "asset/resource",
        },
        {
          test: /\.(png|jpg|gif)$/i,
          type: "asset/inline",
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        },
        {
          test: /\.(eot|otf|ttf|woff|woff2)$/,
          type: "asset/resource",
        },
        {
          test: /\.module\.less$/,
          use: [
            isProduction
              ? MiniCssExtractPlugin.loader
              : { loader: "style-loader" },
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: "[name]_[local]__[hash:base64:5]",
                },
              },
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  modifyVars: {
                    "primary-color": "#4361ee",
                  },
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
        {
          test: /\.less$/,
          exclude: /\.module\.less$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  auto: false,
                },
              },
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  modifyVars: {
                    "primary-color": "#4361ee",
                  },
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx"],
      fallback: {
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        path: require.resolve("path-browserify"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process"),
        url: require.resolve("url/"),
        zlib: require.resolve("browserify-zlib"),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.html"),
        inject: true,
        env: _env.APP_ENV,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      new Dotenv({
        systemvars: true,
      }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "assets/css/[name].[contenthash:8].css",
          chunkFilename: "assets/css/[name].[contenthash:8].chunk.css",
        }),
      new CompressionPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public",
            globOptions: {
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
      // new BundleAnalyzerPlugin()
    ].filter(Boolean),
    optimization: {
      minimize: isProduction,
      innerGraph: true,
      minimize: isProduction,
      removeAvailableModules: true,
      concatenateModules: true,
      innerGraph: true,
      mangleExports: true,
      mangleWasmImports: true,
      mergeDuplicateChunks: true,
      runtimeChunk: "single",
      usedExports: true,
      minimizer: [
        new TerserWebpackPlugin({
          extractComments: false,
          parallel: true,
          terserOptions: {
            compress: {
              comparisons: false,
            },
            mangle: {
              safari10: true,
            },
            output: {
              comments: false,
              ascii_only: true,
            },
            warnings: false,
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: "all",
        minSize: 10000,
        enforceSizeThreshold: 100000,
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        cacheGroups: {
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: "vendor-react",
            chunks: "all",
            priority: 10,
          },
          antdVendor: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            name(module, chunks, cacheGroupKey) {
              const componentName =
                /[\\/]node_modules[\\/](.*?)[\\/](.*?)([\\/]|$)(?:(.*?))([\\/]|$)/.exec(
                  module.context
                );
              const extractedName = `${componentName[1]}-${componentName[2]}-${componentName[4]}`;
              return `${cacheGroupKey}.${extractedName.replace("@", "")}`;
            },
            reuseExistingChunk: true,
            minChunks: 1,
            chunks: "all",
            priority: 5,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module, chunks, cacheGroupKey) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1];
              if (!packageName) {
                return null;
              } else {
                return `${cacheGroupKey}.${packageName.replace("@", "")}`;
              }
            },
            reuseExistingChunk: true,
            minChunks: 1,
            chunks: "all",
            priority: -5,
          },
          common: {
            minChunks: 2,
            chunks: "all",
            priority: -10,
          },
        },
      },
    },
    devServer: {
      compress: true,
      historyApiFallback: true,
      open: true,
      static: false,
      client: {
        logging: "none",
        overlay: {
          errors: false,
          warnings: false,
          runtimeErrors: false,
        },
      },
      port: 3000,
    },
  };
};
