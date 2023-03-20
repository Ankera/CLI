import fse from 'fs-extra';
import path from 'node:path';
import ora from 'ora';
import { log } from '@zm-template/ac-utils';
import { pathExistsSync } from 'path-exists';

export default function installTemplate(selectedTemplate, options) {
  const { force = false } = options;
  const { targetPath, name, template } = selectedTemplate;
  const rootDir = process.cwd();
  fse.ensureDirSync(targetPath);

  const installDir = path.resolve(`${rootDir}/${name}`);
  if(pathExistsSync(installDir)){
      if(!force){
        log.error(`当前目录已存在${name}文件夹`);
        return;
      } else {
        fse.removeSync(installDir);
        fse.ensureDirSync(installDir);
      }
  } else {
    fse.ensureDirSync(installDir);
  }

  copyFile(targetPath, template, installDir);
}

function copyFile(targetPath, template, installDir){
  const originFile = getCacheFilePath(targetPath, template);
  const fileList = fse.readdirSync(originFile);

  const spinner = ora('正在拷贝文件...').start();

  fileList.map((file) => {
    fse.copySync(`${originFile}/${file}`, `${installDir}/${file}`)
  })

  spinner.stop();
  log.success('拷贝成功');
}

function getCacheFilePath(targetPath, template){
  return path.join(targetPath, 'node_modules', template.npmName, 'template');
}
