import { join } from "path";

const defaultOpts = {
  dva: {
    immer: true,
    dynamicImport: true
  },
  routes: {
    exclude: [/model/]
  },
  locale: {
    default: "en-US"
  },
  hardSource: false
};

function template(path) {
  return join(__dirname, "../template", path);
}

function getId(id) {
  return `umi-plugin-vue:${id}`;
}

export default function(api, options) {
  const option = {
    ...defaultOpts,
    ...options
  };

  const { service, config, paths } = api;

  service.paths = {
    ...service.paths,
    defaultEntryTplPath: template("entry.js.mustache"),
    defaultRouterTplPath: template("router.js.mustache"),
    defaultDocumentPath: template("document.ejs")
  };

  api.addVersionInfo([
    `vue@${require("vue/package").version}`,
    `vue-router@${require("vue-router/package").version}`,
    `vue-template-compiler@${require("vue-template-compiler/package").version}`
  ]);

  const plugins = {
    hardSource: () => require("./plugins/hardSource").default,
    routes: () => require("./plugins/routes").default,
    dva: () => require("./plugins/dva").default
  };

  api.registerPlugin({
    id: getId("vue"),
    apply: require("./plugins/vue").default
  });

  Object.keys(plugins).forEach(key => {
    if (option[key]) {
      let opts = option[key];

      api.registerPlugin({
        id: getId(key),
        apply: plugins[key](),
        opts
      });
    }
  });
}
