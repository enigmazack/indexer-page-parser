const pageParser = require('../src/index')
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const name = 'www.hddolby.com'
const html = fs.readFileSync(path.join(__dirname, `../pages/${name}.user.html`))
const htmlSeeding = fs.readFileSync(path.join(__dirname, `../pages/${name}.seeding.html`))
const dom = new JSDOM(html)
const window = dom.window
const document = window.document
if (document.getElementById('ka1').innerHTML == "") {
  document.getElementById('ka1').innerHTML = htmlSeeding
}
const $ = require('jquery')(window)
const results = pageParser($, `https://${name}/userdetails.php`)
console.log(results)
