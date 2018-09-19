"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
function default_1(routes, excludes) {
  function exclude(routes) {
    return routes.filter(function(route) {
      for (var _i = 0, excludes_1 = excludes; _i < excludes_1.length; _i++) {
        var exclude_1 = excludes_1[_i];
        assert(
          typeof exclude_1 === "function" || exclude_1 instanceof RegExp,
          "exclude should be function or RegExp"
        );
        if (typeof exclude_1 === "function" && exclude_1(route)) {
          return false;
        }
        if (
          !route.component.startsWith("() =>") &&
          exclude_1 instanceof RegExp &&
          exclude_1.test(route.component)
        ) {
          return false;
        }
      }
      if (route.children) {
        route.children = exclude(route.children);
      }
      return true;
    });
  }
  return exclude(routes);
}
exports.default = default_1;
