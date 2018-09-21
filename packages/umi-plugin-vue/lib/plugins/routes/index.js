"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getRouteConfigFromDir_1 = require("./getRouteConfigFromDir");
var excludeRoute_1 = require("./excludeRoute");
var utils_1 = require("../../utils");
function default_1(api, opts) {
    if (opts === void 0) { opts = { exclude: [] }; }
    var paths = api.paths;
    api.modifyRoutes(function (memo) {
        return excludeRoute_1.default(getRouteConfigFromDir_1.default(paths), utils_1.optsToArray(opts.exclude));
    });
}
exports.default = default_1;
