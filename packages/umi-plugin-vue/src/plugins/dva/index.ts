import { readFileSync, writeFileSync } from "fs";
import { join, dirname, basename, extname } from "path";
import * as uniq from "lodash.uniq";
import { render } from "mustache";
import { winPath } from "umi-utils";
import { findJSFile, optsToArray, endWithSlash } from "../../utils";

const JS_EXTNAMES = [".js", ".ts"];
const tplfile = "dvaContainer.js";

function template(path) {
  return join(__dirname, "../../../template", `${path}.mustache`);
}

function exclude(models, excludes) {
  return models.filter(model => {
    for (const exclude of excludes) {
      if (typeof exclude === "function" && exclude(getModelName(model))) {
        return false;
      }
      if (exclude instanceof RegExp && exclude.test(getModelName(model))) {
        return false;
      }
    }
    return true;
  });
}

function isPagesPath(path, api) {
  const { paths } = api;
  return (
    endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absPagesPath))
  );
}

function isSrcPath(path, api) {
  const { paths } = api;
  return (
    endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absSrcPath))
  );
}

function getModelName(model) {
  const modelArr = winPath(model).split("/");
  return modelArr[modelArr.length - 1];
}

function getModel(cwd, api) {
  const modelJSPath = findJSFile(cwd, "model", JS_EXTNAMES);
  return modelJSPath ? [winPath(modelJSPath)] : [];
}

function getPageModels(cwd, api) {
  let models = [];
  while (!isPagesPath(cwd, api) && !isSrcPath(cwd, api)) {
    models = models.concat(getModel(cwd, api));
    cwd = dirname(cwd);
  }
  return models;
}

function getModelsWithRoutes(routes, api) {
  const { paths } = api;
  return routes.reduce((memo, route) => {
    return [
      ...memo,
      ...(route.component && route.component.indexOf("() =>") !== 0
        ? getPageModels(join(paths.cwd, route.component), api)
        : []),
      ...(route.children ? getModelsWithRoutes(route.children, api) : [])
    ];
  }, []);
}

function getGlobalModels(api, shouldImportDynamic) {
  const { paths, routes } = api;
  let models = getModel(paths.absSrcPath, api);
  if (!shouldImportDynamic) {
    // 不做按需加载时，还需要额外载入 page 路由的 models 文件
    models = [...models, ...getModelsWithRoutes(routes, api)];
    // 去重
    models = uniq(models);
  }
  return models;
}

function addVersionInfo(api) {
  const { cwd, compatDirname } = api;
  const dvaDir = compatDirname(
    "dva-core/package.json",
    cwd,
    dirname(require.resolve("dva-core/package.json"))
  );

  api.addVersionInfo([
    `dva-core@${require(join(dvaDir, "package.json")).version} (${dvaDir})`,
    `dva-loading@${require("dva-loading/package").version}`,
    `dva-immer@${require("dva-immer/package").version}`
  ]);
}

function addPageWatcher(api) {
  const { paths } = api;
  api.addPageWatcher([
    join(paths.absSrcPath, "models"),
    join(paths.absSrcPath, "dva.js"),
    join(paths.absSrcPath, "dva.ts")
  ]);
}

export default function(
  api,
  opts = {
    immer: false,
    exclude: [],
    shouldImportDynamic: false
  }
) {
  const { paths } = api;

  addVersionInfo(api);
  addPageWatcher(api);

  function getDvaJS() {
    const dvaJS = findJSFile(paths.absSrcPath, "dva", JS_EXTNAMES);
    if (dvaJS) {
      return winPath(dvaJS);
    }
  }

  function getPluginContent() {
    const ret = [];
    if (opts.immer) {
      ret.push(
        `
    app.use(require('${winPath(require.resolve("dva-immer"))}').default());
          `.trim()
      );
    }
    return ret.join("\r\n");
  }

  function getGlobalModelContent() {
    return exclude(
      getGlobalModels(api, opts.shouldImportDynamic),
      optsToArray(opts.exclude)
    )
      .map(path =>
        `
    app.model({ namespace: '${basename(
      path,
      extname(path)
    )}', ...(require('${path}').default) });
  `.trim()
      )
      .join("\r\n");
  }

  api.onGenerateFiles(() => {
    const wrapperTpl = readFileSync(template(tplfile), "utf-8");
    const dvaJS = getDvaJS();
    const wrapperContent = render(wrapperTpl, {
      ExtendDvaConfig: dvaJS
        ? `...((require('${dvaJS}').config || (() => ({})))())`
        : "",
      RegisterPlugins: getPluginContent(),
      RegisterModels: getGlobalModelContent()
    });
    const wrapperPath = join(paths.absTmpDirPath, tplfile);
    writeFileSync(wrapperPath, wrapperContent, "utf-8");
  });

  /** 修改配置文件 */
  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      alias: {
        ...(memo.alias || {}),
        "@ddot/umi-vue": join(paths.absTmpDirPath, tplfile)
      }
    };
  });
}
