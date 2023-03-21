'use strict';

const { Controller } = require('egg');

const ADD_TEMPLATE = [
  {
    name: 'Vue3模块',
    value: 'template-vue3',
    npmName: '@zm-template/template-vue3',
    version: '1.0.0',
    forceInstall: true,
  },
  {
    name: 'React模块',
    value: 'template-react18',
    npmName: '@zm-template/template-react18',
    version: '1.0.0',
    forceInstall: true,
  },
  {
    name: 'vue-element-admin',
    value: 'template-vue-element-admin',
    npmName: '@zm-template/template-vue-element-admin',
    version: '1.0.0',
    forceInstall: true,
  },
];

class ProjectController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = ADD_TEMPLATE;
  }
}

module.exports = ProjectController;
