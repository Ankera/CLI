import { homedir } from 'node:os';
import path from 'node:path';
import { pathExistsSync } from 'path-exists';
import fse from 'fs-extra';
import fs from 'node:fs';
import log from '../log.js';
import { makePassword } from '../inquirer.js';

// 缓存目录
const TEMP_HOME = '.ac-cli';
const TEMP_TOKEN = '.token';
const TEMP_GIT_PLATFORM = '.git_platform';

function  createTokenPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_TOKEN);
}

function createPlatformPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_GIT_PLATFORM);
}

function getGitPlatform() {
  const platformPath = createPlatformPath();
  if(pathExistsSync(platformPath)){
    return fse.readFileSync(platformPath).toString();
  }

  return null;
}

class GitServer {

  async init(platform){
    // 判断token是否录入
    const tokenPath = createTokenPath();
    if(pathExistsSync(tokenPath)){
      this.token = fse.readFileSync(tokenPath).toString();
    } else {
      this.token = await this.getToken();
      fs.writeFileSync(tokenPath, this.token);
    }

    this.savePlatform(platform);

    log.verbose('token', this.token);
    log.verbose('token path', tokenPath);
  }

  getToken() {
    return makePassword({
      message: "请输入token信息"
    })
  }

  savePlatform(platform) {
    this.platform = platform;
    const platformPath = createPlatformPath();
    fs.writeFileSync(platformPath, platform);
  }

  getPlatform() {
    return this.platform;
  }
}

export {
  GitServer,
  getGitPlatform
};