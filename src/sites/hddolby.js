const NexusPhpSite = require('../models/nexusphp-site')

const hddolby = new NexusPhpSite({
  name: 'www.hddolby.com'
})

hddolby.torrentTableIndex.status = 8

hddolby._parseTorrentTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('font.classic').length) tags.push('Official')
  return tags
}

hddolby._parseTorrentStatus = function (query) {
  
}

module.exports = hddolby
