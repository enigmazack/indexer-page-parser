const pageParser = require('../src/index')
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const name = 'www.hdarea.co'
const html = fs.readFileSync(path.join(__dirname, `../pages/${name}/torrent.html`))
const dom = new JSDOM(html)
const $ = require( 'jquery' )(dom.window)
const results = pageParser($, `https://${name}/torrents.php`)
console.log(results)

module.exports = $
