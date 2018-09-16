import { join } from "path";
import {
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync
} from "fs";
import { render } from "mustache";
import { safeLoad } from "js-yaml";

const tplfile = "umi-service.ts";
const defdir = "api";
const extendMethod = {
  /** 解析url的参数 */
  __url: function() {
    return this.url.replace(/{/g, "${");
  },
  /** 提取url参数 */
  __restkey: function() {
    return (this.url.match(/{\w+}/g) || [])
      .map(_ => _.replace(/{|}/g, ""))
      .concat(["...restData"])
      .join(", ");
  },
  /** 判断请求方式 */
  __dataKey: function() {
    return this.method === "get" || this.method === undefined
      ? "params"
      : "data";
  }
};

function getServiceFile(apiPath) {
  let api = {};
  if (existsSync(apiPath)) {
    const localePaths = readdirSync(apiPath);
    for (let i = 0; i < localePaths.length; i++) {
      const fullname = join(apiPath, localePaths[i]);
      const stats = statSync(fullname);
      const fileInfo = /^\w+.yaml$/.exec(localePaths[i]);
      if (stats.isFile() && fileInfo) {
        try {
          api = {
            ...api,
            ...safeLoad(readFileSync(fullname, "utf-8"))
          };
        } catch (e) {
          console.log(e.message);
        }
      }
    }
  }
  return api;
}

export function getServices(apiPath) {
  const serviceApi = getServiceFile(apiPath);
  return Object.keys(serviceApi).reduce((pre, key) => {
    return [...pre, { key, ...serviceApi[key] }];
  }, []);
}

export default function(
  api,
  options = {
    dir: defdir
  }
) {
  const { paths } = api; // 系统的相关配置

  const apiPath = join(paths.absSrcPath, options.dir);

  api.onGenerateFiles(() => {
    const services = getServices(apiPath);

    const wrapperTpl = readFileSync(
      join(__dirname, `../template/${tplfile}.mustache`),
      "utf-8"
    );
    const wrapperContent = render(wrapperTpl, {
      services,
      ...extendMethod
    });
    const wrapperPath = join(paths.absTmpDirPath, tplfile);
    writeFileSync(wrapperPath, wrapperContent, "utf-8");
  });

  /** 添加监听 */
  api.addPageWatcher(apiPath);

  /** 添加配置监听 */
  api.onOptionChange(newOpts => {
    options = newOpts;
    api.rebuildTmpFiles();
  });

  /** 修改配置文件 */
  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      alias: {
        ...(memo.alias || {}),
        "@ddot/umi-service": join(paths.absTmpDirPath, tplfile)
      }
    };
  });
}
