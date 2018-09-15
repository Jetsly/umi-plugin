import { join } from 'path';
import ServicePlugin, { getServiceFile } from './index';
import * as assert from 'assert';

const absSrcPath = join(__dirname, '../examples');
const file = '.umirc.service.yaml';

const api = {
  addPageWatcher() {},
  onOptionChange() {},
  rebuildTmpFiles() {},
  modifyAFWebpackOpts() {},
  paths: {
    absSrcPath,
    absTmpDirPath: absSrcPath,
  },
  config: {
    file,
  },
};

describe('test plugin', () => {
  it('enable is true', () => {
    ServicePlugin(api);
  });
});

describe('test func with file', () => {
  it('getServiceFile', () => {
    const list = getServiceFile(absSrcPath, file);
    assert.deepStrictEqual(list, {
      login: { method: 'POST', url: '/login/{orderId}' },
      logout: { url: '/logout' },
    });
  });
});
