// This script requst the pages and write to file
const sites = require('../pages/request-config.json').sites
const proxy = require('../pages/request-config.json').proxy
const nexusphpRequest = require('./request/nexusphp')
const _ = require('lodash')

_.forEach(sites, (site, name) => {
  if (site.requestType === 'commonNexusphp') {
    nexusphpRequest(site, name, proxy)
  }
})
