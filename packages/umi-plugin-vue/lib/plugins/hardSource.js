"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(api, opts) {
    if (opts === void 0) { opts = false; }
    // 允许用户通过环境变量覆盖配置
    if (!("HARD_SOURCE" in process.env)) {
        process.env.HARD_SOURCE = "" + opts;
    }
}
exports.default = default_1;
