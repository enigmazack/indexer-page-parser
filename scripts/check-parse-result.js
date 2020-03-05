// Usage:
// $ node scripts/check-parse-result.js [site] index/torrent/user (> ./pages/output.js)
// helps checking the results when developing
const process = require('process')
const pageParser = require('../src/index')
const getQueries = require('./utils/sites-query')
const sitesConfig = require('./request-config.json').sites
const { nexusphpPages } = require('./common-configs')

const name = process.argv[2]
const pageType = process.argv[3]
const site = sitesConfig[name]
switch (site.requestType) {
  case 'nexusphp':
    site.pages = nexusphpPages
    break
  default:
}
const url = site.url + site.pages[pageType]
const query = getQueries(name)[pageType]
const result = pageParser(query, url)

console.log('let result = ')
console.log(result)
