"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _webpack = _interopRequireDefault(require("webpack"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @param moduleName
 * @param config
 * @param {NettPack} NettPack
 * @return {{}}
 */
function _default(moduleName, config, NettPack) {
  var plugins = [new _webpack["default"].optimize.OccurrenceOrderPlugin(), new _webpack["default"].NoEmitOnErrorsPlugin()];
  var baseConfig = {
    entry: {},
    mode: "development",
    module: {
      rules: [{
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }, {
        test: /\.less$/,
        loader: ['style-loader', 'css-loader', 'less-loader']
      }]
    }
  };
  var entryApp = [];

  if (NettPack.mode === "development") {
    plugins.push(new _webpack["default"].HotModuleReplacementPlugin());
    entryApp.push("webpack-hot-middleware/client?path=" + config.host + config.publicPath + "/" + moduleName + "/__webpack_hmr&timeout=" + config.webpackHmr);
    baseConfig.devServer = {
      publicPath: config.publicPath + "/" + moduleName
    };
  }

  baseConfig.entry.app = entryApp;
  baseConfig.plugins = plugins;
  return baseConfig;
}

;