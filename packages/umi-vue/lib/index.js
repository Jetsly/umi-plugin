"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("dva-core");
var vue_1 = require("vue");
var clonedeep = require("lodash.clonedeep");
var isequal = require("lodash.isequal");
var char = "/";
var store = null;
var getNestedState = function (state, path) {
    return path
        .split(char)
        .filter(function (a) { return a; })
        .reduce(function (state, key) { return state[key]; }, state);
};
var normalizeNamespace = function (fn) { return function (namespace, map) {
    if (typeof namespace !== "string") {
        map = namespace;
        namespace = "";
    }
    else if (namespace.charAt(namespace.length - 1) !== char) {
        namespace += char;
    }
    return fn(namespace, map);
}; };
var normalizeMap = function (map) {
    return Array.isArray(map)
        ? map.map(function (key) { return ({ key: key, val: key }); })
        : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); });
};
var resetStoreVM = function () {
    var oldVm = store._vm;
    store._vm = new vue_1.default({
        data: {
            $$state: clonedeep(store.getState())
        }
    });
    if (oldVm) {
        vue_1.default.nextTick(function () {
            return oldVm.$destroy();
        });
    }
};
var createOpts = {
    setupApp: function (app) {
        app._history = window.g_history;
        store = app._store;
        store.subscribe(function () {
            var state = clonedeep(store.getState());
            Object.keys(state).forEach(function (namespace) {
                Object.keys(state[namespace]).forEach(function (key) {
                    if (store._vm._data.$$state[namespace] &&
                        !isequal(store._vm._data.$$state[namespace][key], state[namespace][key])) {
                        store._vm._data.$$state[namespace][key] = state[namespace][key];
                    }
                });
            });
        });
        resetStoreVM();
        app.changeModel = function () {
            var rest = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                rest[_i] = arguments[_i];
            }
            app.model.bind(app).apply(void 0, rest);
            resetStoreVM();
        };
    }
};
function umiVue(config) {
    return core.create(config, createOpts);
}
exports.default = umiVue;
exports.dispatch = function () {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i] = arguments[_i];
    }
    return store.dispatch.bind(store).apply(void 0, rest);
};
exports.mapState = normalizeNamespace(function (namespace, states) {
    var res = {};
    normalizeMap(states).forEach(function (_a) {
        var key = _a.key, val = _a.val;
        res[key] = function mappedState() {
            var _state = getNestedState(store._vm._data.$$state, namespace);
            return typeof val === "function"
                ? val(_state)
                : getNestedState(_state, val);
        };
    });
    return res;
});
