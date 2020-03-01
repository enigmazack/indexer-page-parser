const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const html = fs.readFileSync(path.join(__dirname, '../pages/www.hddolby.com.torrent.html'))
const dom = new JSDOM(html)

const $ = require( 'jquery' )(dom.window)

// module.exports = $

const NexusPhpSite = require('../src/models/nexusphp-site')

const hddolby = new NexusPhpSite({
  name: 'www.hddolby.com'
})

const results = hddolby.pageParser($, 'https://www.hddolby.com/torrents.php')

console.log(results)
