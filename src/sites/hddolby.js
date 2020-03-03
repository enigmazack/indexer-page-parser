const NexusPhpSite = require('../models/nexusphp-site')

const hddolby = new NexusPhpSite({
  name: 'www.hddolby.com'
})

hddolby._parseTags = (query) => {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('font.classic').length) tags.push('Official')
  return tags
}

module.exports = hddolby
