'use strict';

const { Controller } = require('egg');

class ProjectController extends Controller {
  // 项目模块查询
  async index() {
    const { ctx } = this;
    const template = await ctx.service.project.list();
    if (template && Array.isArray(template)) {
      const newTemplate = template.map(item => ({
        ...item,
        npmName: item['npm-name'],
      }));
      ctx.body = newTemplate;
    } else {
      ctx.body = [];
    }

  }

  async create() {
    const { ctx } = this;

    ctx.body = 'create create';
  }

  async update() {
    const { ctx } = this;
    ctx.body = 'ADD_TEMPLATE';
  }

  async destroy() {
    const { ctx } = this;
    ctx.body = 'ADD_TEMPLATE';
  }

  async show() {
    const { ctx } = this;
    const id = ctx.params.id;
    const ADD_TEMPLATE = await ctx.service.project.list();
    const template = ADD_TEMPLATE.find(_ => _.value === id);
    ctx.body = template ? template : '空';
  }
}

module.exports = ProjectController;
