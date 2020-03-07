const NexusPhpSite = require('../models/nexusphp-site')

const hdchina = new NexusPhpSite({
  name: 'hdchina.org'
})

hdchina._parseTorrentSubtitle = function (query) {
  return query.find('h4').text()
}

hdchina._parseTorrentStatus = function (query) {
  const isActive = !!query.find('.progress_seeding, .progress_no_downloading').length
  const progressQuery = query.find('.progress')
  const progress = progressQuery.length
    ? parseFloat(progressQuery.find('> div').attr('style').match(/width.+?(\d[\d.]*)%/)[1])
    : 0
  return { isActive, progress }
}

hdchina._parseTorrentTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Stick"]').length) tags.push('Sticky')
  if (/share_rule_1/.test(query.find('td.share_rule').html())) tags.push('Exclusive')
  return tags
}

module.exports = hdchina
