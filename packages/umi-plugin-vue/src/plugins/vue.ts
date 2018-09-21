const VueLoaderPlugin = require("vue-loader/lib/plugin");

const routerVue = `require('./router').default`;

export default function(api) {
  const { config, paths } = api;

  const mountElementId = config.mountElementId || "root";

  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.extensions.merge([".vue"]);

    webpackConfig.module
      .rule("exclude")
      .exclude.add(/\.(vue)$/)
      .end();

    webpackConfig.module
      .delete("jsx")
      .rule("vue")
      .test(/\.vue$/)
      .include.add(paths.cwd)
      .end()
      .exclude.add(/node_modules/)
      .end()
      .use("vue-loader")
      .loader(require.resolve("vue-loader"));
    webpackConfig.plugin("vue-plugin").use(VueLoaderPlugin);

    return webpackConfig;
  });

  api.modifyEntryRender(() => {
    return `new Vue({
        router: ${routerVue},
        render (h) {
          return h('router-view')
        }
      }).$mount('#${mountElementId}'); `;
  });

  api.modifyEntryHistory(() => {
    return `${routerVue}.history`;
  });

  api.modifyRouterRootComponent(() => {
    return config.history || "history";
  });
}
