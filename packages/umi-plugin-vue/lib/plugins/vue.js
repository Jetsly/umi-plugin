"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VueLoaderPlugin = require("vue-loader/lib/plugin");
var routerVue = "require('./router').default";
function default_1(api) {
    var config = api.config, paths = api.paths;
    var mountElementId = config.mountElementId || "root";
    api.chainWebpackConfig(function (webpackConfig) {
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
    api.modifyEntryRender(function () {
        return "new Vue({\n        router: " + routerVue + ",\n        render (h) {\n          return h('router-view')\n        }\n      }).$mount('#" + mountElementId + "'); ";
    });
    api.modifyEntryHistory(function () {
        return routerVue + ".history";
    });
    api.modifyRouterRootComponent(function () {
        return config.history || "history";
    });
}
exports.default = default_1;
