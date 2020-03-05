const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const getQueries = (name) => {
  const dirPath = path.join(__dirname, '../../pages', name)
  const fileList = fs.readdirSync(dirPath)
  const query = {}
  fileList.forEach(file => {
    const key = path.parse(file).name
    const html = fs.readFileSync(path.join(dirPath, file))
    const dom = new JSDOM(html, { contentType: 'text/html; charset=utf-8' })
    query[key] = require('jquery')(dom.window)
  })
  return query
}

module.exports = getQueries
