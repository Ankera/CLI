import fse from 'fs-extra';
import path from 'node:path';
import ora from 'ora';
import { log, makeList } from '@zm-template/ac-utils';
import { pathExistsSync } from 'path-exists';
import ejs from 'ejs';
import glob from 'glob';


export default async function installTemplate(selectedTemplate, options) {
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

  /**
   * 拷贝文件，从缓存目录拷贝到指定目录下面
   */
  copyFile(targetPath, template, installDir);

  /**
   * 对下载原文件，进行ejs模块替换
   */
  await ejsRender(targetPath, installDir, template, selectedTemplate.name);
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

/**
 * 找到缓存目录
 */
function getCacheFilePath(targetPath, template){
  return path.join(targetPath, 'node_modules', template.npmName, 'template');
}

/**
 * 找到缓存插件
 */
function getPluginFilePath(targetPath, template){
  return path.join(targetPath, 'node_modules', template.npmName, 'plugins', 'index.js');
}

/**
 * ejs 模块替换
 */
async function ejsRender(targetPath, installDir, template, name) {
  const { value, ignore } = template;
  const newIgnore = ignore.split(',');
  log.verbose('忽略正则', newIgnore);
  
  let data = {};
  const pluginPath = getPluginFilePath(targetPath, template);
  // 执行插件
  if(pathExistsSync(pluginPath)){
    const pluginFn = (await import(pluginPath)).default;
    data = await pluginFn({ makeList });
  }

  console.log('===', data)

  const ejsData = {
    data: {
      name,
      ...data,
    }
  }
  glob('**', {
    cwd: installDir,
    nodir: true,
    ignore: [
      ...newIgnore,
      '**/node_modules/**',
    ]
  }, (err, files) => {
    if(Array.isArray(files)){
      files.forEach(file => {
        const filePath = path.join(installDir, file);
        ejs.renderFile(filePath, ejsData, (err, result) => {
          if(!err) {
            fse.writeFileSync(filePath, result);
          } else {
            log.error("Error",err);
          }
        })
      })
    }
  });
}
