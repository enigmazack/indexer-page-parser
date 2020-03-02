const pageParser = require('../src/index')
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const name = 'www.hddolby.com'
const html = fs.readFileSync(path.join(__dirname, `../pages/${name}/index.html`))
const dom = new JSDOM(html)
const $ = require( 'jquery' )(dom.window)
const results = pageParser($, `https://${name}/index.php`)
console.log(results)
