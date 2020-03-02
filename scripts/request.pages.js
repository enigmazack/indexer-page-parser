const sites = require('../pages/request.pages.config.json').sites
const proxy = require('../pages/request.pages.config.json').proxy
const axios = require('axios')
const HttpsProxyAgent = require('https-proxy-agent')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')

_.forEach(sites, (site, name) => {
  const requestConfig = {}
  requestConfig.baseURL = site.url
  requestConfig.headers = {
    Cookie: site.cookies
  }
  // add proxy config
  if (site.enableProxy) {
    if (new URL(site.url).protocol == 'https:') {
      const agent = new HttpsProxyAgent(proxy)
      requestConfig.httpsAgent = agent
    } else {
      requestConfig.proxy = {
        host: new URL(proxy).hostname,
        port: new URL(proxy).port
      }
    }
  }
  const request = axios.create(requestConfig)
  _.forEach(site.pages, (page, key) => {
    const filePath = path.join(__dirname, `../pages/${name}/${key}.html`)
    const dirPath = path.dirname(filePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
    if (fs.existsSync(filePath)) {
      console.log(`${name}/${key}: skip`)
    } else {
      request(page)
        .then(res => {
          if (res.status == 200) {
            fs.writeFileSync(filePath, res.data)
            console.log(`${name}/${key}: added`)
          } else {
            console.log(`${name}/${key}: response code ${res.status}`)
          }
        })
        .catch(err => {
          console.log(`${name}/${key}: ${err}`)
        })
    }
  })
})