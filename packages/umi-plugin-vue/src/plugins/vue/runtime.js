import Vue from "vue";

export function rootContainer(router) {
  return new Vue({
    router,
    render(h) {
      return h("router-view");
    }
  });
}
