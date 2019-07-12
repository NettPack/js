"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _webpack = _interopRequireDefault(require("webpack"));

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
    mode: process.env.NODE_ENV,
    resolve: {
      alias: {}
    }
  };
  var entryApp = [];

  if (process.env.NODE_ENV === "development") {
    plugins.push(new _webpack["default"].HotModuleReplacementPlugin());
    entryApp.push("webpack-hot-middleware/client?path=" + config.host + config.publicPath + "/" + moduleName + "/__webpack_hmr&timeout=" + config.webpackHmr + "&noInfo=" + config.noInfo);
    baseConfig.devServer = {
      publicPath: config.publicPath + "/" + moduleName
    };
  }

  baseConfig.entry.app = entryApp;
  baseConfig.plugins = plugins;
  return baseConfig;
}

;