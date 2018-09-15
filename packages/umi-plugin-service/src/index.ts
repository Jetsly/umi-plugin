import { join } from 'path';
import { existsSync, statSync, readFileSync, writeFileSync } from 'fs';
import { render } from 'mustache';
import { safeLoad } from 'js-yaml';

export function getServiceFile(cwd, file) {
  const fullname = join(cwd, file);
  if (existsSync(fullname)) {
    const stats = statSync(fullname);
    try {
      return stats.isFile()
        ? safeLoad(readFileSync(fullname, 'utf-8'))
        : {};
    } catch (e) {
      console.log(e);
      return {};
    }
  }
  return {};
}

export default function(
  api,
  options = {
    file: '.umirc.service.yaml',
  },
) {
  const { config, paths } = api;
  const { cwd } = api.service;

  const serviceApi = getServiceFile(cwd, options.file);

  const wrapperTpl = readFileSync(
    join(__dirname, '../template/service.ts.tpl'),
    'utf-8',
  );
  const wrapperContent = render(wrapperTpl, {
    
  });
  const wrapperPath = join(paths.absTmpDirPath, './service.ts');
  writeFileSync(wrapperPath, wrapperContent, 'utf-8');

  /** 添加监听 */
  api.addPageWatcher(join(cwd, options.file));

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
        '@umi/service': join(paths.absTmpDirPath, './service.ts'),
      },
    };
  });
}
