import * as core from "dva-core";
import Vue from "vue";

const clonedeep = require("lodash.clonedeep");
const isequal = require("lodash.isequal");

declare var window: Window;
interface Window {
  g_history: string;
}
const char = "/";
let store = null;

const getNestedState = (state, path) =>
  path
    .split(char)
    .filter(a => a)
    .reduce((state, key) => state[key], state);

const normalizeNamespace = fn => (namespace, map) => {
  if (typeof namespace !== "string") {
    map = namespace;
    namespace = "";
  } else if (namespace.charAt(namespace.length - 1) !== char) {
    namespace += char;
  }
  return fn(namespace, map);
};

const normalizeMap = map =>
  Array.isArray(map)
    ? map.map(key => ({ key: key, val: key }))
    : Object.keys(map).map(key => ({ key: key, val: map[key] }));

const resetStoreVM = () => {
  const oldVm = store._vm;
  store._vm = new Vue({
    data: {
      $$state: clonedeep(store.getState())
    }
  });
  if (oldVm) {
    Vue.nextTick(function() {
      return oldVm.$destroy();
    });
  }
};

const createOpts = {
  setupApp(app) {
    app._history = window.g_history;
    store = app._store;

    store.subscribe(() => {
      const state = clonedeep(store.getState());
      Object.keys(state).forEach(namespace => {
        Object.keys(state[namespace]).forEach(key => {
          if (
            store._vm._data.$$state[namespace] &&
            !isequal(
              store._vm._data.$$state[namespace][key],
              state[namespace][key]
            )
          ) {
            store._vm._data.$$state[namespace][key] = state[namespace][key];
          }
        });
      });
    });
    resetStoreVM();
    app.changeModel = (...rest) => {
      app.model.bind(app)(...rest);
      resetStoreVM();
    };
  }
};

export default function umiVue(config) {
  return core.create(config, createOpts);
}

export const dispatch = (...rest) => store.dispatch.bind(store)(...rest);

export const mapState = normalizeNamespace((namespace, states) => {
  let res = {};
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState() {
      const _state = getNestedState(store._vm._data.$$state, namespace);
      return typeof val === "function"
        ? val(_state)
        : getNestedState(_state, val);
    };
  });
  return res;
});
