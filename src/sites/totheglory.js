const NexusPhpSite = require('../models/nexusphp-site')

// totheglory has a lot commons with nexusphp site
const totheglory = new NexusPhpSite({
  name: 'totheglory.im'
})

totheglory.pageParser = function ($, url) {
  const path = new URL(url).pathname
  switch (path) {
    case '/index.php':
      return this._indexPageParser($)
    case '/browse.php':
      return this._torrentPageParser($)
    case '/userdetails.php':
      return this._userPageParser($)
    default:
      return {}
  }
}

totheglory._parserUploadTraffic = function (query) {
  return this._parseSize(query.text())
}

totheglory._parserDownloadTraffic = function (query) {
  return this._parseSize(query.text())
}

totheglory._parseUserClass = function (query) {
  return query.text()
}

totheglory._parseSeedingTorrents = function (query) {
  const table = query.find('#ka2').find('table')
  const tdParserList = [
    {
      name: 'id',
      index: 1,
      parseFunction: q => {
        const id = q.find('a[href*="details.php?id="]').attr('href').match(/id=(\d+)/)[1]
        return parseInt(id)
      }
    },
    {
      name: 'size',
      index: 3,
      parseFunction: q => this._parseTorrentSize(q)
    }
  ]
  return this._parseChartTable(table, tdParserList)
}

totheglory.torrentTableIndex = {
  category: 0,
  title: 1,
  date: 4,
  size: 6,
  seeds: 8,
  leeches: 8,
  snatched: 7,
  status: 1
}

totheglory._parseTorrentCategory = function (query) {
  return query.find('img').attr('alt')
}

totheglory._parseTorrentId = function (query) {
  const titleQuery = query.find('a[href*="/t/"]')
  return parseInt(titleQuery.attr('href').match(/\d+/)[0])
}

totheglory._parseTorrentTitle = function (query) {
  const titleQuery = query.find('a[href*="/t/"]')
  return titleQuery.html().match(/>(.*?)</)[1]
}

totheglory._parseTorrentSubtitle = function (query) {
  const titleQuery = query.find('a[href*="/t/"]')
  let subtitle = titleQuery.find('span').text()
  const match = titleQuery.html().match(/<\/span>(.*?)</)
  subtitle += match ? match[1] : 0
  return subtitle.trim()
}

totheglory._parseTorrentTags = function (query) {
  const tags = []
  if (query.find('img[src*="headtopic"]').length) tags.push('Sticky')
  if (query.find('span.excl').length) tags.push('Exclusive')
  return tags
}

totheglory._parseTorrentDate = function (query) {
  const date = query.html().match(/>(.*)</)[1].replace('<br>', ' ')
  return new Date(date).getTime()
}

totheglory._parseTorrentPromotion = function (query) {
  let type = ''
  let isFreeleech = false
  switch (true) {
    case !!query.find('img[src*="ico_free"]').length:
      type = 'Free'
      isFreeleech = true
      break
    case !!query.find('img[src*="ico_30"]').length:
      type = '30%'
      break
    case !!query.find('img[src*="ico_half"]').length:
      type = '50%'
      break
    default:
  }
  const dateMatch = query.html().match(/Freeleech将持续到(\d+)年(\d+)月(\d+)日(\d+)点(\d+)分/)
  const deadline = dateMatch
    ? new Date(dateMatch[1], dateMatch[2], dateMatch[3], dateMatch[4], dateMatch[5]).getTime()
    : 0
  return { isFreeleech, type, deadline }
}

totheglory._parseTorrentSeeds = function (query) {
  return parseInt(query.find('a[href*="toseeders"]').text())
}

totheglory._parseTorrentLeeches = function (query) {
  return parseInt(query.find('a[href*="todlers"]').text())
}

totheglory._parseTorrentStatus = function (query) {
  const isActive = !!query.find('div.process').length
  const progress = isActive
    ? parseFloat(query.find('div.process > span').attr('style').match(/width:.?(\d.+)%/)[1])
    : 0
  return { isActive, progress }
}

module.exports = totheglory
