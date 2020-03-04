const NexusPhpSite = require('../models/nexusphp-site')

const hdchina = new NexusPhpSite({
  name: 'hdchina.org'
})

hdchina._parseSubTitle = (query) => {
  return query.find('h4').text()
}

module.exports = hdchina
