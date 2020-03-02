const process = require('process')
const pageParser = require('../src/index')
const getQueries = require('./utils/sites-query')
const sitesConfig = require('../pages/request-pages-config.json').sites

const name = process.argv[2]
const pageType = process.argv[3]
const url = sitesConfig[name].url + sitesConfig[name].pages[pageType]
const query = getQueries(name)[pageType]
const result = pageParser(query, url)

console.log(result)
