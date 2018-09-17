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
var VueLoaderPlugin = require("vue-loader/lib/plugin");
function template(path) {
  return path_1.join(__dirname, "../template", path);
}
function default_1(api, options) {
  var service = api.service,
    config = api.config,
    paths = api.paths;
  var mountElementId = config.mountElementId || "root";
  service.paths = __assign({}, service.paths, {
    defaultEntryTplPath: template("entry.js.mustache"),
    defaultRouterTplPath: template("empty.js.mustache"),
    defaultDocumentPath: template("document.ejs")
  });
  api.modifyRoutes(function(memo) {
    return [
      {
        path: "/"
      }
    ];
  });
  api.chainWebpackConfig(function(webpackConfig) {
    webpackConfig.resolve.extensions.merge([".vue"]);
    webpackConfig.module
      .rule("exclude")
      .exclude.add(/\.(vue)$/)
      .end();
    webpackConfig.module
      .delete("jsx")
      .rule("vue")
      .test(/\.vue$/)
      .include.add(paths.cwd)
      .end()
      .exclude.add(/node_modules/)
      .end()
      .use("vue-loader")
      .loader(require.resolve("vue-loader"));
    webpackConfig.plugin("vue-plugin").use(VueLoaderPlugin);
    return webpackConfig;
  });
  api.modifyEntryRender(function() {
    return (
      '  new Vue({\n      el: "#' +
      mountElementId +
      "\",\n      render (h) {\n        return h(require('" +
      paths.absSrcPath +
      "pages/index').default)\n      }\n    }); "
    );
  });
  api.modifyEntryHistory(function() {
    return "undefined";
  });
}
exports.default = default_1;
