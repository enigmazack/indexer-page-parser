const NexusPhpSite = require('../models/nexusphp-site')

const springsunday = new NexusPhpSite({
  name: 'springsunday.net'
})

springsunday._parseTags = (query) => {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('span.exclusive').length) tags.push('Exclusive')
  return tags
}

springsunday._parseBonus = (query) => {
  const bonusString = query.text().match(/(魔力值|Points).+?([\d,.]+)/)[2]
  return springsunday._parseNumber(bonusString)
}

module.exports = springsunday
