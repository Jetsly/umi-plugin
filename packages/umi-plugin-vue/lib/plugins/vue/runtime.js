"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
function rootContainer(router) {
    return new vue_1.default({
        router: router,
        render: function (h) {
            return h("router-view");
        }
    });
}
exports.rootContainer = rootContainer;
