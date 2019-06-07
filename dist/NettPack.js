"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NettPack = void 0;

var _WebpackConfig = _interopRequireDefault(require("./WebpackConfig"));

var _Config = _interopRequireDefault(require("./Config"));

var _neonJs = _interopRequireDefault(require("neon-js"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var NettPack =
/*#__PURE__*/
function () {
  function NettPack(configFile) {
    _classCallCheck(this, NettPack);

    this.config = _objectSpread({}, _Config["default"]);

    if (configFile && _fs["default"].existsSync(configFile)) {
      var content = _fs["default"].readFileSync(configFile, 'utf8');

      var config = _neonJs["default"].decode(content).toObject(true);

      if (config.parameters !== undefined && config.parameters.nettpack !== undefined) {
        this.config = this._deepMarge(this.config, config.parameters.nettpack);
      }
    }

    this.modules = {};
    this.mode = "development";
    this.appDir = _path["default"].dirname(require.main.filename);
  }
  /**
   * @param {boolean} val
   */


  _createClass(NettPack, [{
    key: "enableProduction",
    value: function enableProduction(val) {
      if (val === true) {
        this.mode = "production";
        return;
      }

      this.mode = "development";
    }
    /**
     * @param {string} name
     * @param {{}} module
     */

  }, {
    key: "addAppModule",
    value: function addAppModule(name, module) {
      this.modules[name] = module;
    }
    /**
     * @return {number}
     */

  }, {
    key: "getAppPort",
    value: function getAppPort() {
      return this.config.port;
    }
    /**
     * @return {{}}
     */

  }, {
    key: "buildModules",
    value: function buildModules() {
      var packages = this.loadComposerAssets();
      /** INSTALL MODULE (admin, front.....) */

      var modules = {};

      for (var name in this.modules) {
        var module = this.modules[name];
        var baseWebpack = {};

        if (typeof _WebpackConfig["default"] === "function") {
          baseWebpack = (0, _WebpackConfig["default"])(name, this.config, this);
        } else {
          baseWebpack = _objectSpread({}, _WebpackConfig["default"]);
        }

        baseWebpack.mode = this.mode;

        this._applyModule(packages, baseWebpack, name);

        var moduleConfig = {};

        if (typeof module === "function") {
          moduleConfig = module(name, this.config, this);
        } else {
          moduleConfig = _objectSpread({}, module);
        }

        modules[name] = this._deepMarge(baseWebpack, moduleConfig);
      }

      return modules;
    }
  }, {
    key: "_applyModule",
    value: function _applyModule(packages, webPackConfig, moduleName) {
      for (var i in packages) {
        var packageSettings = packages[i].settings;
        var packageName = packages[i].name;

        if (!packageSettings.modules) {
          continue;
        }

        for (var moduleIndex in packageSettings.modules) {
          if (moduleIndex === moduleName) {
            if (!webPackConfig.entry.packages || !webPackConfig.entry.packages.isArray()) {
              webPackConfig.entry.packages = [];

              if (this.mode === "development") {
                webPackConfig.entry.packages.push(this._getHotEntry(moduleName));
              }
            }

            var entries = packageSettings.modules[moduleIndex];

            if (Array.isArray(entries)) {
              for (var index in entries) {
                var _entry = entries[index];

                var _vendorPath = this._getPath(this.appDir, this.config.vendorPath);

                _entry = this._getPath(_vendorPath + "/" + packageName, _entry);
                webPackConfig.entry.packages.push(_entry);
              }

              continue;
            }

            var entry = packageSettings.modules[moduleIndex];

            var vendorPath = this._getPath(this.appDir, this.config.vendorPath);

            entry = this._getPath(vendorPath + "/" + packageName, entry);
            webPackConfig.entry.packages.push(entry);
          }
        }
      }
    }
    /**
     * @param {string} name
     * @return {string}
     * @private
     */

  }, {
    key: "_getHotEntry",
    value: function _getHotEntry(name) {
      return "webpack-hot-middleware/client?path=" + this.config.host + this.config.publicPath + "/" + name + "/__webpack_hmr&timeout=" + this.config.webpackHmr;
    }
    /**
     * @return {Array}
     */

  }, {
    key: "loadComposerAssets",
    value: function loadComposerAssets() {
      var lockFile = this.config.composerLockFile;

      var content = _fs["default"].readFileSync(lockFile, 'utf8');

      content = JSON.parse(content);
      var packages = [];

      for (var i in content.packages) {
        var pack = content.packages[i];

        if (pack.extra && pack.extra.nettpack && pack.extra.nettpack) {
          var nettpackConfig = pack.extra.nettpack;
          packages.push({
            name: pack.name,
            settings: nettpackConfig
          });
        }
      }

      return packages;
    }
    /**
     * @param object
     * @param other
     * @private
     */

  }, {
    key: "_deepMarge",
    value: function _deepMarge(object, other) {
      return _lodash["default"].mergeWith(object, other, function customizer(objValue, srcValue) {
        if (_lodash["default"].isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      });
    }
    /**
     * @param {string} prefix
     * @param {string} path
     * @return {string}
     * @private
     */

  }, {
    key: "_getPath",
    value: function _getPath(prefix, path) {
      if (path.substr(0, 1) === ".") {
        return prefix + path.substr(1);
      }

      return path;
    }
  }]);

  return NettPack;
}();

exports.NettPack = NettPack;