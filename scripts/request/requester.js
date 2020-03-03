const axios = require('axios')
const HttpsProxyAgent = require('https-proxy-agent')

const requester = (site, proxy) => {
  const requestConfig = {}
  requestConfig.baseURL = site.url
  requestConfig.headers = {
    Cookie: site.cookies
  }
  // add proxy config
  if (site.enableProxy) {
    if (new URL(site.url).protocol === 'https:') {
      const agent = new HttpsProxyAgent(proxy)
      requestConfig.httpsAgent = agent
    } else {
      requestConfig.proxy = {
        host: new URL(proxy).hostname,
        port: new URL(proxy).port
      }
    }
  }
  return axios.create(requestConfig)
}

module.exports = requester
