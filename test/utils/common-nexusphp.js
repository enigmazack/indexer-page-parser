const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const assemble = (name) => {
  const indexHtml = fs.readFileSync(path.join(__dirname, `../../pages/${name}/index.html`))
  const userHtml = fs.readFileSync(path.join(__dirname, `../../pages/${name}/user.html`))
  const seedingHtml = fs.readFileSync(path.join(__dirname, `../../pages/${name}/seeding.html`))
  const torrentHtml = fs.readFileSync(path.join(__dirname, `../../pages/${name}/torrent.html`))

  const indexDom = new JSDOM(indexHtml)
  const userDom = new JSDOM(userHtml)
  const torrentDom = new JSDOM(torrentHtml)

  if (userDom.window.document.getElementById('ka1').innerHTML == "") {
    userDom.window.document.getElementById('ka1').innerHTML = seedingHtml
  }

  const query = {}
  query.index = require('jquery')(indexDom.window)
  query.user = require('jquery')(userDom.window)
  query.torrent = require('jquery')(torrentDom.window)
  
  return query
}

module.exports = assemble