const NexusPhpSite = require('../models/nexusphp-site')

const ourbits = new NexusPhpSite({
  name: 'ourbits.club'
})

ourbits._parseTags = (query) => {
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

ourbits._parseStatus = (query, index) => {
  const isActive = !!query.eq(index.title).find('div.doing').length
  const text = query.eq(index.status).text()
  const progress = /-/.test(text) ? 0 : parseFloat(text)
  let status = ''
  if (isActive) {
    status = progress === 100 ? 'Seeding' : 'Leeching'
  } else {
    status = progress === 100 ? 'Snatched' : 'Stopped'
  }
  status = /-/.test(text) ? '' : status
  return {
    status,
    progress
  }
}

module.exports = ourbits
