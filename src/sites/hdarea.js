const NexusPhpSite = require('../models/nexusphp-site')

const hdarea = new NexusPhpSite({
  name: 'www.hdarea.co'
})

hdarea._parseTorrentStatus = function (query) {
  const isActive = !!query.find('table[title="downloading"], table[title="seeding"]').length
  const progressQuery = query.find('img.progress')
  const progress = progressQuery.length
    ? parseInt(progressQuery.parent().attr('style').match(/width.+?(\d[\d.]*)%/)[1])
    : 0
  return { isActive, progress }
}

module.exports = hdarea
