"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cached = {};
var registerModel = function (model) {
    if (!cached[model.namespace]) {
        window.g_app.changeModel(model);
        cached[model.namespace] = 1;
    }
};
exports.default = (function (config) {
    var resolveModels = config.models, resolveComponent = config.component;
    var models = typeof resolveModels === "function" ? resolveModels() : [];
    var component = resolveComponent();
    return function () {
        return new Promise(function (resolve) {
            Promise.all(models.concat([component])).then(function (ret) {
                if (!models || !models.length) {
                    return resolve(ret[0]);
                }
                else {
                    var len = models.length;
                    ret.slice(0, len).forEach(function (m) {
                        registerModel(m.default);
                    });
                    resolve(ret[len]);
                }
            });
        });
    };
});
