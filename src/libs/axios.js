import Vue from 'vue'
import axios from 'axios'
import store from '@/store'
import globalConfig from '@/config'
import { getToken } from '@/libs/util'

// import { Spin } from 'iview'
const addErrorLog = errorInfo => {
  const { statusText, status, request: { responseURL } } = errorInfo
  let info = {
    type: 'ajax',
    code: status,
    mes: statusText,
    url: responseURL
  }
  if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
}

class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        'Authorization': getToken()
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      if (res.data.code !== 0 && res.data.code !== '00000') {
        Vue.$Notice.error({
          title: res.data.msg,
          duration: 1
        })
        console.log('报错:' + res.data.msg)
      } else {
        if (res.data.data != null) return res.data.data
      }
    }, error => {
      this.destroy(url)
      let errorInfo = error.response
      if (!errorInfo) {
        const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: { responseURL: config.url }
        }
      }
      addErrorLog(errorInfo)
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.urlRouter(this.getInsideConfig(), options), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }

  urlRouter (config, options) {
    const jobURL = process.env.NODE_ENV === 'development' ? globalConfig.jobUrl.dev : globalConfig.jobUrl.pro
    const messageUrl = process.env.NODE_ENV === 'development' ? globalConfig.messageUrl.dev : globalConfig.messageUrl.pro
    const urlconfig = {
      baseURL: config.baseURL,
      headers: config.headers
    }
    const url = options.url.split('/', 1)[0]
    if (url === 'scheduler') {
      urlconfig.baseURL = jobURL
    }
    if (url === 'message') {
      urlconfig.baseURL = messageUrl
    }
    return urlconfig
  }
}
export default HttpRequest
