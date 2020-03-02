const NexusPhpSite = require('../models/nexusphp-site')

const ourbits = new NexusPhpSite({
  name: 'ourbits.club'
})

hddolby._parseTags = (query) => {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('div.tag-gf').length) tags.push('Official')
  if (query.find('div.tag-diy').length) tags.push('DIY')
  if (query.find('div.tag-gy').length) tags.push('ChineseAudio')
  if (query.find('div.tag-zz').length) tags.push('ChineseSubtitles')
  if (query.find('div.tag-jz').length) tags.push('KeepInside')
  if (query.find('div.tag-sf').length) tags.push('FirstRelease')
  return tags
}

module.exports = ourbits