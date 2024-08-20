const Service = require('egg').Service;

class ProjectService extends Service {
  getTableName() {
    return 'base_npm';
  }

  async list() {
    const result = await this.app.mysql.select(this.getTableName(), {
      where: {},
      limit: 10, // 返回数据量
      offset: 0, // 数据偏移量
    });
    return result;
  }
}

module.exports = ProjectService;
