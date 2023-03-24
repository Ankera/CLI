import { GitServer } from './gitServer.js'
import axios from 'axios'

const BASE_URL = 'https://api.github.com'

class Github extends GitServer {
  constructor() {
    super()

    this.server = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    })

    this.server.interceptors.request.use(
      (config) => {
        config.headers['Accept'] = 'application/vnd.github+json'
        config.headers['X-GitHub-Api-Version'] = '2022-11-28'
        config.headers['Authorization'] = `Bearer ${this.token}`
        return config
      },
      (err) => {
        return Promise.reject(err)
      }
    )

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
      params,
      method: 'GET',
      headers,
    })
  }

  post(url, params, headers) {
    return this.server({
      url,
      data: params,
      method: 'POST',
      headers,
    })
  }

  searchRepositories(params) {
    return this.get('/search/repositories', params)
  }

  searchCode(params) {
    return this.get('/search/code', params)
  }

  getTags(fullName, params) {
    return this.get(`/repos/${fullName}/tags`, params)
  }

  getRepoUrl(fullName) {
    return `https://github.com/${fullName}.git`
  }
}

export default Github
