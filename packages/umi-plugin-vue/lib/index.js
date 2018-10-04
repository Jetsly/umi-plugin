"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var defaultOpts = {
    dva: {
        immer: true
    },
    routes: {
        exclude: [/model/]
    },
    dll: {
        include: []
    },
    dynamicImport: {
        webpackChunkName: true
    },
    hardSource: true
};
function template(path) {
    return path_1.join(__dirname, "../template", path);
}
function getId(id) {
    return "umi-plugin-vue:" + id;
}
function default_1(api, options) {
    var option = __assign({}, defaultOpts, options);
    var service = api.service, config = api.config, paths = api.paths;
    service.paths = __assign({}, service.paths, { defaultEntryTplPath: template("entry.js.mustache"), defaultRouterTplPath: template("router.js.mustache"), defaultDocumentPath: template("document.ejs") });
    api.addVersionInfo([
        "vue@" + require("vue/package").version,
        "vue-router@" + require("vue-router/package").version,
        "vue-template-compiler@" + require("vue-template-compiler/package").version,
    ]);
    api.modifyAFWebpackOpts(function (memo) {
        return __assign({}, memo, { alias: __assign({}, (memo.alias || {}), { "@ddot/umi-vue/dynamic": "@ddot/umi-vue/lib/dynamic.js" }) });
    });
    var plugins = {
        hardSource: function () { return require("./plugins/hardSource").default; },
        dll: function () { return require("./plugins/dll").default; },
        routes: function () { return require("./plugins/routes").default; },
        dva: function () { return require("./plugins/dva").default; }
    };
    api.registerPlugin({
        id: getId("vue"),
        apply: require("./plugins/vue").default
    });
    Object.keys(plugins).forEach(function (key) {
        if (option[key]) {
            var opts = option[key];
            if (key === "dll") {
                var havDva = option["dva"] ? ["dva-core", "dva-immer"] : [];
                opts.include = (opts.include || []).concat([
                    "vue",
                    "vue-router"
                ].concat(havDva));
            }
            else if (key === "dva") {
                opts = __assign({}, opts, { shouldImportDynamic: option.dynamicImport });
            }
            api.registerPlugin({
                id: getId(key),
                apply: plugins[key](),
                opts: opts
            });
        }
    });
}
exports.default = default_1;
