const path = require("path");
const glob = require("glob");

//js圧縮 SyntaxtError出て使えないけど一応残す
//const TerserPlugin = require("terser-webpack-plugin");

const entries = {};
const _path = {
  dist: "./resources/assets",
  src: "./resources/src",
};
glob
  .sync("**/*.js", {
    ignore: "**/_*.js",
    cwd: _path.src + "/js",
  })
  .map(function (key) {
    entries[key] = path.resolve(_path.src + "/js", key);
  });

module.exports = {
  mode: "production", //production or development
  entry: entries,
  output: {
    // path: path.join(__dirname, _path.dist + '/js'), // defined by gulpfile.js
    filename: "[name]",
  },
  //js圧縮 SyntaxtError出て使えないけど一応残す
  //  optimization: {
  //    minimizer: [
  //      new TerserPlugin({
  //        extractComments: 'all',
  //        terserOptions: {
  //          compress: {
  //            drop_console: true,
  //          },
  //        },
  //      }),
  //    ],
  //  },
  performance: { hints: false },
  module: {
    rules: [
      {
        // node_module内のcss
        test: /node_modules\/(.+)\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: { url: false },
          },
        ],
        sideEffects: true, // production modeでもswiper-bundle.cssが使えるように
      },
      {
        test: /\.js$/,
        exclude: [/node_modules\/(?!(dom7|ssr-window|swiper)\/).*/],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    corejs: 3,
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
};
