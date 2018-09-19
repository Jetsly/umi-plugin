import { join } from "path";
import getRouteConfigFromDir from "./getRouteConfigFromDir";
import excludeRoute from "./excludeRoute";

const VueLoaderPlugin = require("vue-loader/lib/plugin");

const routerVue = `require('./router').default`;

function template(path) {
  return join(__dirname, "../template", path);
}
function optsToArray(item) {
  if (!item) return [];
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

export default function(
  api,
  opts = {
    routes: {
      exclude: []
    }
  }
) {
  const { service, config, paths } = api;

  const mountElementId = config.mountElementId || "root";
  service.paths = {
    ...service.paths,
    defaultEntryTplPath: template("entry.js.mustache"),
    defaultRouterTplPath: template("router.js.mustache"),
    defaultDocumentPath: template("document.ejs")
  };

  api.modifyRoutes(memo => {
    return excludeRoute(
      getRouteConfigFromDir(paths),
      optsToArray(opts.routes ? opts.routes.exclude : [])
    );
  });

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
