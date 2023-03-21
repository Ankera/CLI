import { homedir } from 'node:os';
import path from 'node:path';
import { log, makeList, getLastesVersion, request, printErrorLog } from '@zm-template/ac-utils';

const ADD_TYPE_PROPERTY = 'project';
const ADD_TYPE_PAGE = 'page';
// 缓存目录
const TEMP_HOME = '.ac-cli'

// const ADD_TEMPLATE = [
//   {
//     name: 'Vue3模块',
//     value: "template-vue3",
//     npmName: "@zm-template/template-vue3",
//     version: "1.0.0",
//     forceInstall: true,
//   },
//   {
//     name: 'React模块',
//     value: "template-react18",
//     npmName: "@zm-template/template-react18",
//     version: "1.0.0",
//     forceInstall: true,
//   },
//   {
//     name: 'vue-element-admin',
//     value: "template-vue-element-admin",
//     npmName: "@zm-template/template-vue-element-admin",
//     version: "1.0.0",
//     forceInstall: true,
//   }
// ];

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
function getAddTemplate(ADD_TEMP) {
  return makeList({
    choices: ADD_TEMP,
    message: "请选择项目模板"
  })
}

// 团队列表
function getAddTeam(team) {
  return makeList({
    choices: team.map(item => ({name: item, value: item})),
    message: "请选择团队"
  })
}

async function getTemplateFromAPI() {
  try {
    const data = await request({
      url: "/v1/project",
      method: "get",
    });
    return data;
  } catch (error) {
    printErrorLog(error);
    return null;
  }
}

// 安装的缓存目录
function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, 'addTemplate')
}

export default async function createTemplate(name, opts) {
  const ADD_TEMPLATE = await getTemplateFromAPI();
  if(!ADD_TEMPLATE){
    throw new Error('项目模块不存在')
  }
  const { type = null, template = null } = opts;
  let addType; //  项目类型
  let addName;  // 项目名称
  let selectedTemplate;

  if(type){
    addType = type;
  } else {
    addType = await getAddType();
  }
  log.verbose('addType', addType);

  if(addType === ADD_TYPE_PROPERTY){
    if(name){
      addName = name;
    } else {
      addName = await getAddName();
    }
    log.verbose('addName', addName);

    if(template){
      selectedTemplate = ADD_TEMPLATE.find(t => t.value === template);
      if(!selectedTemplate){
        throw new Error(`项目模板${addType}不存在`);
      }
    } else {
      // 获取团队列表
      let teamList = ADD_TEMPLATE.map(t => t.team);
      teamList = [...new Set(teamList)];
      const addTeam = await getAddTeam(teamList);
      log.verbose('addTeam', addTeam);

      const addTemplate = await getAddTemplate(ADD_TEMPLATE.filter(item => item.team === addTeam));

      selectedTemplate = ADD_TEMPLATE.find(t => t.value === addTemplate);
    }
  } else {
    throw new Error(`创建的项目类型${addType}不支持`);
  }

  log.verbose('selectedTemplate', selectedTemplate);

  const lastVerson =  await getLastesVersion(selectedTemplate.npmName);

  selectedTemplate.version = lastVerson;
  
  // 缓存目录
  const targetPath = makeTargetPath();

  return {
    type: addType,
    name: addName,
    template: selectedTemplate,
    targetPath
  }
}