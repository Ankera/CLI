import { homedir } from 'node:os';
import path from 'node:path';
import { log, makeList, getLastesVersion } from '@zm-template/ac-utils';

const ADD_TYPE_PROPERTY = 'project';
const ADD_TYPE_PAGE = 'page';
// 缓存目录
const TEMP_HOME = '.ac-cli'

const ADD_TEMPLATE = [
  {
    name: 'Vue3模块',
    value: "template-vue3",
    npmName: "@zm-template/template-vue3",
    version: "1.0.0",
    forceInstall: true,
  },
  {
    name: 'React模块',
    value: "template-react18",
    npmName: "@zm-template/template-react18",
    version: "1.0.0",
    forceInstall: true,
  }
];

const ADD_TYPE = [
  {
    name: '项目',
    value: ADD_TYPE_PROPERTY
  },
  {
    name: '页面',
    value: ADD_TYPE_PAGE
  }
]

// 获取创建类型
function getAddType() {
  return makeList({
    choices: ADD_TYPE,
    defaultValue: ADD_TYPE_PROPERTY,
    message: "请选择初始化类型"
  })
}

//  获取项目名称
function getAddName() {
  return makeList({
    type: 'input',
    message: "请输入项目名称",
    validate: (v) => {
      if(v.length > 0) {
        return true;
      }
      return '必须输入项目名称';
    }
  })
}

// 获取项目模板
function getAddTemplate() {
  return makeList({
    choices: ADD_TEMPLATE,
    message: "请选择项目模板"
  })
}

// 安装的缓存目录
function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, 'addTemplate')
}

export default async function createTemplate(name, opts) {
  const addType = await getAddType();
  const addName = await getAddName();
  const addTemplate = await getAddTemplate();
  log.verbose('addType', addType, addName, addTemplate);

  const selectedTemplate = ADD_TEMPLATE.find(t => t.value === addTemplate);

  const lastVerson =  await getLastesVersion(selectedTemplate.npmName);

  selectedTemplate.version = lastVerson;
  
  const targetPath = makeTargetPath();

  return {
    type: addType,
    name: addName,
    template: selectedTemplate,
    targetPath
  }
}