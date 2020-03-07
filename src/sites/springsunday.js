const NexusPhpSite = require('../models/nexusphp-site')

const springsunday = new NexusPhpSite({
  name: 'springsunday.net'
})

springsunday.torrentTableIndex = {
  category: 0,
  title: 1,
  date: 4,
  size: 5,
  seeds: 6,
  leeches: 7,
  snatched: 8,
  status: 1
}

springsunday._parseTorrentTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('span.exclusive').length) tags.push('Exclusive')
  return tags
}

springsunday._parseBonus = function (query) {
  const bonusString = query.text().match(/(魔力值|Points).+?([\d,.]+)/)[2]
  return this._parseNumber(bonusString)
}

springsunday._parseTorrentStatus = function (query) {
  const progressBarQuery = query.find('div.progress_bar')
  const subscriptionQuery = query.find('a[id*="subscription"] > img')
  let isActive = false
  let progress = 0
  if (progressBarQuery.length) {
    // parse frome progress bar
    // need enable from site settings
    isActive = !progressBarQuery.find('div.p_inactive').length
    if (progressBarQuery.find('div.p_seeding').length) {
      progress = 100
    } else {
      progress = progressBarQuery.find('> div > div').attr('style').match(/width.+?(\d[\d.]*)%/)[1]
      progress = parseFloat(progress)
    }
    return { isActive, progress }
  }
  if (subscriptionQuery.length) {
    // parse frome subscription icon in case progress bar disabled
    // won't parse inactive torrents
    switch (true) {
      case subscriptionQuery.is('.uploading'):
        isActive = true
        progress = 100
        break
      case subscriptionQuery.is('.downloading'):
        isActive = true
        progress = subscriptionQuery.attr('title').match(/(\d[\d.]*)%/)[1]
        break
      default:
    }
  }
  return { isActive, progress }
}

module.exports = springsunday
