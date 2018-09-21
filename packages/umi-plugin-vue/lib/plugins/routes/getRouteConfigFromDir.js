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
// https://github.com/umijs/umi/blob/master/packages/umi-build-dev/src/routes/getRouteConfigFromDir.js
var fs_1 = require("fs");
var path_1 = require("path");
var umi_utils_1 = require("umi-utils");
var utils_1 = require("../../utils");
function getRouteConfigFromDir(paths) {
    var cwd = paths.cwd, absPagesPath = paths.absPagesPath, absSrcPath = paths.absSrcPath, _a = paths.dirPath, dirPath = _a === void 0 ? "" : _a;
    var absPath = path_1.join(absPagesPath, dirPath);
    var files = fs_1.readdirSync(absPath);
    var absLayoutFile = utils_1.findJSFile(absPagesPath, "_layout");
    if (absLayoutFile) {
        throw new Error("root _layout.vue is not supported, use layouts/index.vue instead");
    }
    var children = files
        .filter(function (file) {
        if (file.charAt(0) === "." || file.charAt(0) === "_")
            return false;
        return true;
    })
        .sort(function (a) { return (a.charAt(0) === "$" ? 1 : -1); })
        .reduce(handleFile.bind(null, paths, absPath), [])
        .map(function (a) {
        delete a.isParamsRoute;
        return a;
    });
    if (dirPath === "" && absSrcPath) {
        var globalLayoutFile = utils_1.findJSFile(absSrcPath, "layouts/index") ||
            utils_1.findJSFile(absSrcPath, "layout/index");
        if (globalLayoutFile) {
            var wrappedRoutes = [];
            addRoute(wrappedRoutes, {
                path: "/",
                component: "./" + path_1.relative(cwd, globalLayoutFile),
                children: children
            }, {
                componentFile: globalLayoutFile
            });
            return wrappedRoutes;
        }
    }
    return children;
}
exports.default = getRouteConfigFromDir;
function handleFile(paths, absPath, memo, file) {
    var cwd = paths.cwd, absPagesPath = paths.absPagesPath, _a = paths.dirPath, dirPath = _a === void 0 ? "" : _a;
    var absFilePath = path_1.join(absPath, file);
    var stats = fs_1.statSync(absFilePath);
    var isParamsRoute = file.charAt(0) === "$";
    if (stats.isDirectory()) {
        var newDirPath = path_1.join(dirPath, file);
        // routes & _layout
        var children = getRouteConfigFromDir(__assign({}, paths, { dirPath: newDirPath }));
        var absLayoutFile = utils_1.findJSFile(path_1.join(absPagesPath, newDirPath), "_layout");
        if (absLayoutFile) {
            addRoute(memo, {
                path: normalizePath(newDirPath),
                component: "./" + umi_utils_1.winPath(path_1.relative(cwd, absLayoutFile)),
                children: children
            }, {
                componentFile: absLayoutFile
            });
        }
        else {
            memo = memo.concat(children);
        }
    }
    else if (stats.isFile() && utils_1.isValidJS(file)) {
        var bName = path_1.basename(file, path_1.extname(file));
        var path = normalizePath(path_1.join(dirPath, bName));
        addRoute(memo, {
            path: path,
            component: "./" + umi_utils_1.winPath(path_1.relative(cwd, absFilePath))
        }, {
            componentFile: absFilePath
        });
    }
    return memo;
}
function normalizePath(path) {
    var newPath = "/" + umi_utils_1.winPath(path)
        .split("/")
        .map(function (path) { return path.replace(/^\$/, ":").replace(/\$$/, "?"); })
        .join("/");
    // /index/index -> /
    if (newPath === "/index/index") {
        newPath = "/";
    }
    // /xxxx/index -> /xxxx/
    newPath = newPath.replace(/\/index$/, "/");
    // remove the last slash
    // e.g. /abc/ -> /abc
    if (newPath !== "/" && newPath.slice(-1) === "/") {
        newPath = newPath.slice(0, -1);
    }
    return newPath;
}
function addRoute(memo, route, _a) {
    var componentFile = _a.componentFile;
    memo.push(__assign({}, route));
}
