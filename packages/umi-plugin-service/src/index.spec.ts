import { join } from "path";
import ServicePlugin, { getServices } from "./index";

import * as assert from "assert";
import { readFileSync } from "fs";
const absSrcPath = join(__dirname, "../examples");
const dir = "api";
const jsonfile = "service.json";

const api = {
  generateFiles() {},
  addPageWatcher() {},
  onOptionChange() {},
  rebuildTmpFiles() {},
  modifyAFWebpackOpts() {},
  onGenerateFiles(generateFiles) {
    api.generateFiles = generateFiles;
  },
  paths: {
    absSrcPath,
    absTmpDirPath: absSrcPath
  },
  config: {
    dir
  },
  service: {
    cwd: absSrcPath
  }
};

describe("test func with file", () => {
  it("getServices", () => {
    const apiPath = join(absSrcPath, dir);
    const list = getServices(apiPath);
    const json = JSON.parse(readFileSync(join(absSrcPath, jsonfile), "utf-8"));
    assert.deepStrictEqual(list, json);
  });

  it("get tpl", () => {
    ServicePlugin(api);
    api.generateFiles();
  });
});
