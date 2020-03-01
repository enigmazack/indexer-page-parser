const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const html = fs.readFileSync(path.join(__dirname, '../pages/www.hddolby.com.user.html'))
const dom = new JSDOM(html)

const $ = require( 'jquery' )(dom.window)

module.exports = $
