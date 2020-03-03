const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const getQueries = (name) => {
  const indexHtml = fs.readFileSync(path.join(__dirname, `../../pages/${name}/index.html`))
  const userHtml = fs.readFileSync(path.join(__dirname, `../../pages/${name}/user.html`))
  const torrentHtml = fs.readFileSync(path.join(__dirname, `../../pages/${name}/torrent.html`))

  const indexDom = new JSDOM(indexHtml, { contentType: 'text/html; charset=utf-8' })
  const userDom = new JSDOM(userHtml, { contentType: 'text/html; charset=utf-8' })
  const torrentDom = new JSDOM(torrentHtml, { contentType: 'text/html; charset=utf-8' })

  const query = {}
  query.index = require('jquery')(indexDom.window)
  query.user = require('jquery')(userDom.window)
  query.torrent = require('jquery')(torrentDom.window)

  return query
}

module.exports = getQueries
