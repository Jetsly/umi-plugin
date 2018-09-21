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
var fs_1 = require("fs");
var path_1 = require("path");
var uniq = require("lodash.uniq");
var mustache_1 = require("mustache");
var umi_utils_1 = require("umi-utils");
var utils_1 = require("../../utils");
var JS_EXTNAMES = [".js", ".ts"];
var tplfile = "dvaContainer.js";
function template(path) {
    return path_1.join(__dirname, "../../../template", path + ".mustache");
}
function exclude(models, excludes) {
    return models.filter(function (model) {
        for (var _i = 0, excludes_1 = excludes; _i < excludes_1.length; _i++) {
            var exclude_1 = excludes_1[_i];
            if (typeof exclude_1 === "function" && exclude_1(getModelName(model))) {
                return false;
            }
            if (exclude_1 instanceof RegExp && exclude_1.test(getModelName(model))) {
                return false;
            }
        }
        return true;
    });
}
function isPagesPath(path, api) {
    var paths = api.paths;
    return (utils_1.endWithSlash(umi_utils_1.winPath(path)) === utils_1.endWithSlash(umi_utils_1.winPath(paths.absPagesPath)));
}
function isSrcPath(path, api) {
    var paths = api.paths;
    return (utils_1.endWithSlash(umi_utils_1.winPath(path)) === utils_1.endWithSlash(umi_utils_1.winPath(paths.absSrcPath)));
}
function getModelName(model) {
    var modelArr = umi_utils_1.winPath(model).split("/");
    return modelArr[modelArr.length - 1];
}
function getModel(cwd, api) {
    var modelJSPath = utils_1.findJSFile(cwd, "model", JS_EXTNAMES);
    return modelJSPath ? [umi_utils_1.winPath(modelJSPath)] : [];
}
function getPageModels(cwd, api) {
    var models = [];
    while (!isPagesPath(cwd, api) && !isSrcPath(cwd, api)) {
        models = models.concat(getModel(cwd, api));
        cwd = path_1.dirname(cwd);
    }
    return models;
}
function getModelsWithRoutes(routes, api) {
    var paths = api.paths;
    return routes.reduce(function (memo, route) {
        return memo.concat((route.component && route.component.indexOf("() =>") !== 0
            ? getPageModels(path_1.join(paths.cwd, route.component), api)
            : []), (route.children ? getModelsWithRoutes(route.children, api) : []));
    }, []);
}
function getGlobalModels(api, shouldImportDynamic) {
    var paths = api.paths, routes = api.routes;
    var models = getModel(paths.absSrcPath, api);
    if (!shouldImportDynamic) {
        // 不做按需加载时，还需要额外载入 page 路由的 models 文件
        models = models.concat(getModelsWithRoutes(routes, api));
        // 去重
        models = uniq(models);
    }
    return models;
}
function addVersionInfo(api) {
    var cwd = api.cwd, compatDirname = api.compatDirname;
    var dvaDir = compatDirname("dva-core/package.json", cwd, path_1.dirname(require.resolve("dva-core/package.json")));
    api.addVersionInfo([
        "dva-core@" + require(path_1.join(dvaDir, "package.json")).version + " (" + dvaDir + ")",
        "dva-loading@" + require("dva-loading/package").version,
        "dva-immer@" + require("dva-immer/package").version
    ]);
}
function addPageWatcher(api) {
    var paths = api.paths;
    api.addPageWatcher([
        path_1.join(paths.absSrcPath, "models"),
        path_1.join(paths.absSrcPath, "dva.js"),
        path_1.join(paths.absSrcPath, "dva.ts")
    ]);
}
function default_1(api, opts) {
    if (opts === void 0) { opts = {
        immer: false,
        exclude: [],
        shouldImportDynamic: false
    }; }
    var paths = api.paths;
    addVersionInfo(api);
    addPageWatcher(api);
    function getDvaJS() {
        var dvaJS = utils_1.findJSFile(paths.absSrcPath, "dva", JS_EXTNAMES);
        if (dvaJS) {
            return umi_utils_1.winPath(dvaJS);
        }
    }
    function getPluginContent() {
        var ret = [];
        if (opts.immer) {
            ret.push(("\n    app.use(require('" + umi_utils_1.winPath(require.resolve("dva-immer")) + "').default());\n          ").trim());
        }
        return ret.join("\r\n");
    }
    function getGlobalModelContent() {
        return exclude(getGlobalModels(api, opts.shouldImportDynamic), utils_1.optsToArray(opts.exclude))
            .map(function (path) {
            return ("\n    app.model({ namespace: '" + path_1.basename(path, path_1.extname(path)) + "', ...(require('" + path + "').default) });\n  ").trim();
        })
            .join("\r\n");
    }
    api.onGenerateFiles(function () {
        var wrapperTpl = fs_1.readFileSync(template(tplfile), "utf-8");
        var dvaJS = getDvaJS();
        var wrapperContent = mustache_1.render(wrapperTpl, {
            ExtendDvaConfig: dvaJS
                ? "...((require('" + dvaJS + "').config || (() => ({})))())"
                : "",
            RegisterPlugins: getPluginContent(),
            RegisterModels: getGlobalModelContent()
        });
        var wrapperPath = path_1.join(paths.absTmpDirPath, tplfile);
        fs_1.writeFileSync(wrapperPath, wrapperContent, "utf-8");
    });
    /** 修改配置文件 */
    api.modifyAFWebpackOpts(function (memo) {
        return __assign({}, memo, { alias: __assign({}, (memo.alias || {}), { "@ddot/umi-vue": path_1.join(paths.absTmpDirPath, tplfile) }) });
    });
}
exports.default = default_1;
