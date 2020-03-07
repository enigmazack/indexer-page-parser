const NexusPhpSite = require('../models/nexusphp-site')

const leaguehd = new NexusPhpSite({
  name: 'leaguehd.com'
})

leaguehd.torrentTableIndex.status = 8

leaguehd._parseTorrentStatus = function (query) {
  const isActive = /peer-active/.test(query.attr('class'))
  const progress = /-/.test(query.text()) ? 0 : parseFloat(query.text())
  return { isActive, progress }
}

module.exports = leaguehd
