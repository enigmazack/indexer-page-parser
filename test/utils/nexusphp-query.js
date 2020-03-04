const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const getQueries = (name) => {
  const query = {}
  const pages = ['index', 'user', 'torrent']
  pages.forEach(page => {
    const html = fs.readFileSync(path.join(__dirname, `../../pages/${name}/${page}.html`))
    const dom = new JSDOM(html, { contentType: 'text/html; charset=utf-8' })
    query[page] = require('jquery')(dom.window)
  })
  return query
}

module.exports = getQueries
