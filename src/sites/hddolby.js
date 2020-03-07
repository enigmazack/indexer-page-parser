const NexusPhpSite = require('../models/nexusphp-site')

const hddolby = new NexusPhpSite({
  name: 'www.hddolby.com'
})

hddolby.torrentTableIndex.status = 8

hddolby._parseTorrentStatus = function (query) {
  const progress = /-/.test(query.text()) ? 0 : parseFloat(query.text())
  // hddolby is absent for active identification
  return { isActive: false, progress }
}

hddolby._parseTorrentTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('font.classic').length) tags.push('Official')
  return tags
}

module.exports = hddolby
