const requester = require('./requester')
const singlePageHandle = require('./single-page-handle')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const requestPages = (site, name, proxy) => {
  const request = requester(site, proxy)
  const pages = site.pages
  const dirPath = path.join(__dirname, `../../pages/${name}`)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  _.forEach(pages, (page, key) => {
    singlePageHandle(name, page, key, request, dirPath)
  })
}

module.exports = requestPages
