// This script requst the pages and write to file
const sites = require('../pages/request-config.json').sites
const proxy = require('../pages/request-config.json').proxy
const nexusphpRequest = require('./request/nexusphp')
const pagesRequest = require('./request/pages')
const individualRequest = require('./request/individual')
const _ = require('lodash')

_.forEach(sites, (site, name) => {
  switch (site.requestType) {
    case 'nexusphp':
      // insert seeding torrent data into user page
      // as the most common Nexusphp sites do
      nexusphpRequest(site, name, proxy)
      break
    case 'pages':
      // GET each pages presented in the site request config
      pagesRequest(site, name, proxy)
      break
    case 'individual':
      individualRequest(site, name, proxy)
      break
    default:
  }
})
