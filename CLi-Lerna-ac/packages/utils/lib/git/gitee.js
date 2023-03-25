import { GitServer } from './gitServer.js'
import axios from 'axios'

const BASE_URL = 'https://gitee.com/api/v5'

class Gitee extends GitServer {
  constructor() {
    super()

    this.server = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    })

    this.server.interceptors.response.use(
      (response) => {
        return response.data
      },
      (err) => {
        return Promise.reject(err)
      }
    )
  }

  get(url, params, headers) {
    return this.server({
      url,
      params: {
        access_token: this.token,
        ...params,
      },
      method: 'GET',
      headers,
    })
  }

  post(url, data, headers) {
    return this.server({
      url,
      data: {
        ...data,
      },
      params: {
        access_token: this.token,
      },
      method: 'POST',
      headers,
    })
  }

  searchRepositories(params) {
    return this.get('/search/repositories', params)
  }

  getTags(fullName) {
    return this.get(`/repos/${fullName}/tags`)
  }

  getRepoUrl(fullName) {
    return `https://toscode.gitee.com/${fullName}.git`
  }

  getUser() {
    return this.get('/user')
  }

  getOrg() {
    return this.get('/user/orgs')
  }

  async createRepo(name) {
    // 创建个人仓库
    if (this.own === 'user') {
      return await this.post('/user/repos', { name })
    } else {
      // 创建组织仓库
      return await this.post(`/orgs/${this.login}/repos`, { name })
    }
  }
}

export default Gitee
