"use strict";
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs_1 = require("fs");
var mustache_1 = require("mustache");
var js_yaml_1 = require("js-yaml");
var tplfile = "umi-service.ts";
var defdir = "api";
var extendMethod = {
  /** 解析url的参数 */
  __url: function() {
    return this.url.replace(/{/g, "${");
  },
  /** 提取url参数 */
  __restkey: function() {
    return (this.url.match(/{\w+}/g) || [])
      .map(function(_) {
        return _.replace(/{|}/g, "");
      })
      .concat(["...restData"])
      .join(", ");
  },
  /** 判断请求方式 */
  __dataKey: function() {
    return this.method === "get" || this.method === undefined
      ? "params"
      : "data";
  }
};
function getServiceFile(apiPath) {
  var api = {};
  if (fs_1.existsSync(apiPath)) {
    var localePaths = fs_1.readdirSync(apiPath);
    for (var i = 0; i < localePaths.length; i++) {
      var fullname = path_1.join(apiPath, localePaths[i]);
      var stats = fs_1.statSync(fullname);
      var fileInfo = /^\w+.yaml$/.exec(localePaths[i]);
      if (stats.isFile() && fileInfo) {
        try {
          api = __assign(
            {},
            api,
            js_yaml_1.safeLoad(fs_1.readFileSync(fullname, "utf-8"))
          );
        } catch (e) {
          console.log(e.message);
        }
      }
    }
  }
  return api;
}
function getServices(apiPath) {
  var serviceApi = getServiceFile(apiPath);
  return Object.keys(serviceApi).reduce(function(pre, key) {
    return pre.concat([__assign({ key: key }, serviceApi[key])]);
  }, []);
}
exports.getServices = getServices;
function default_1(api, options) {
  if (options === void 0) {
    options = {
      dir: defdir
    };
  }
  var paths = api.paths; // 系统的相关配置
  var apiPath = path_1.join(paths.absSrcPath, options.dir);
  api.onGenerateFiles(function() {
    var services = getServices(apiPath);
    var wrapperTpl = fs_1.readFileSync(
      path_1.join(__dirname, "../template/" + tplfile + ".mustache"),
      "utf-8"
    );
    var wrapperContent = mustache_1.render(
      wrapperTpl,
      __assign({ services: services }, extendMethod)
    );
    var wrapperPath = path_1.join(paths.absTmpDirPath, tplfile);
    fs_1.writeFileSync(wrapperPath, wrapperContent, "utf-8");
  });
  /** 添加监听 */
  api.addPageWatcher(apiPath);
  /** 添加配置监听 */
  api.onOptionChange(function(newOpts) {
    options = newOpts;
    api.rebuildTmpFiles();
  });
  /** 修改配置文件 */
  api.modifyAFWebpackOpts(function(memo) {
    return __assign({}, memo, {
      alias: __assign({}, memo.alias || {}, {
        "@ddot/umi-service": path_1.join(paths.absTmpDirPath, tplfile)
      })
    });
  });
}
exports.default = default_1;
