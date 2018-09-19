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
var getRouteConfigFromDir_1 = require("./getRouteConfigFromDir");
var excludeRoute_1 = require("./excludeRoute");
var VueLoaderPlugin = require("vue-loader/lib/plugin");
var routerVue = "require('./router').default";
function template(path) {
  return path_1.join(__dirname, "../template", path);
}
function optsToArray(item) {
  if (!item) return [];
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}
function default_1(api, opts) {
  if (opts === void 0) {
    opts = {
      routes: {
        exclude: []
      }
    };
  }
  var service = api.service,
    config = api.config,
    paths = api.paths;
  var mountElementId = config.mountElementId || "root";
  service.paths = __assign({}, service.paths, {
    defaultEntryTplPath: template("entry.js.mustache"),
    defaultRouterTplPath: template("router.js.mustache"),
    defaultDocumentPath: template("document.ejs")
  });
  api.modifyRoutes(function(memo) {
    return excludeRoute_1.default(
      getRouteConfigFromDir_1.default(paths),
      optsToArray(opts.routes ? opts.routes.exclude : [])
    );
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
      "new Vue({\n    router: " +
      routerVue +
      ",\n    render (h) {\n      return h('router-view')\n    }\n  }).$mount('#" +
      mountElementId +
      "'); "
    );
  });
  api.modifyEntryHistory(function() {
    return routerVue + ".history";
  });
  api.modifyRouterRootComponent(function() {
    return config.history || "history";
  });
}
exports.default = default_1;
