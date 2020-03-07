const NexusPhpSite = require('../models/nexusphp-site')

const hdarea = new NexusPhpSite({
  name: 'www.hdarea.co'
})

hdarea._parseTorrentStatus = function (query) {
  let isActive = false
  let progress = 0
  switch (true) {
    case query.find('table[title="downloading"]').length === 1:
    case query.find('table[title="seeding"]').length === 1:
      isActive = true
      break
    default:
  }
  const progressQuery = query.find('img.progress')
  if (progressQuery.length) {
    progress = parseInt(progressQuery.parent().attr('style').match(/width.+?(\d[\d.]*)%/)[1])
  }
  return { isActive, progress }
}

module.exports = hdarea
