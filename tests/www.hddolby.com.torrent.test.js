const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const name = 'www.hddolby.com'

const html = fs.readFileSync(path.join(__dirname, `../pages/${name}.torrent.html`))
const dom = new JSDOM(html)

const $ = require( 'jquery' )(dom.window)

// module.exports = $

const NexusPhpSite = require('../src/models/nexusphp-site')

const site = new NexusPhpSite({ name })

const results = site.pageParser($, `https://${name}/torrents.php`)

console.log(results)
