const NexusPhpSite = require('../models/nexusphp-site')

const hddolby = new NexusPhpSite({
  name: 'www.hddolby.com'
})

hddolby._parseTags = (query) => {
  const tags = []
  switch (true) {
    case query.find('img[alt*="Sticky"]'):
      tags.push('Sticky')
      break
    case query.find('font.classic'):
      tags.push('Official')
      break
    default:
  }
  return tags
}

module.exports = hddolby
