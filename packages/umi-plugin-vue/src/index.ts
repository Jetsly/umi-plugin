import { join } from "path";

const VueLoaderPlugin = require("vue-loader/lib/plugin");

function template(path) {
  return join(__dirname, "../template", path);
}

export default function(api, options) {
  const { service, config, paths } = api;

  const mountElementId = config.mountElementId || "root";
  service.paths = {
    ...service.paths,
    defaultEntryTplPath: template("entry.js.mustache"),
    defaultRouterTplPath: template("empty.js.mustache"),
    defaultDocumentPath: template("document.ejs")
  };

  api.modifyRoutes(memo => {
    return [
      {
        path: "/"
      }
    ];
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
    return `  new Vue({
      el: "#${mountElementId}",
      render (h) {
        return h(require('${paths.absSrcPath}pages/index').default)
      }
    }); `;
  });
  api.modifyEntryHistory(() => {
    return "undefined";
  });
}
