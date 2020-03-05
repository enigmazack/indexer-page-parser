const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

const getQueries = (name) => {
  const query = {}
  const pages = ['index', 'user', 'torrent']
  pages.forEach(page => {
    const html = fs.readFileSync(path.join(__dirname, `../../pages/${name}/${page}.html`))
    query[page] = cheerio.load(html)
  })
  return query
}

module.exports = getQueries
