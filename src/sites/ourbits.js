const NexusPhpSite = require('../models/nexusphp-site')

const ourbits = new NexusPhpSite({
  name: 'ourbits.club'
})

ourbits._parseTorrentTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('div.tag-gf').length) tags.push('Internal')
  if (query.find('div.tag-diy').length) tags.push('DIY')
  if (query.find('div.tag-gy').length) tags.push('ChineseAudio')
  if (query.find('div.tag-zz').length) tags.push('ChineseSubtitles')
  if (query.find('div.tag-jz').length) tags.push('Exclusive')
  if (query.find('div.tag-sf').length) tags.push('FirstRelease')
  return tags
}

ourbits._parseTorrentStatus = function (query) {
  const isActive = !!query.find('div.doing').length
  const progress = /-/.test(query.text()) ? 0 : parseFloat(query.text())
  return { isActive, progress }
}

module.exports = ourbits
