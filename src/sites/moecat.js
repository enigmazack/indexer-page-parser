const NexusPhpSite = require('../models/nexusphp-site')

const moecat = new NexusPhpSite({
  name: 'moecat.bast'
})

/**
 * @todo Implement this function.
 */
moecat._parseMessage = function () {
  // TODO
  return 0
}

moecat.pageParser = function ($, url) {
  const path = new URL(url).pathname
  switch (path) {
    case '/index.php':
      return this._indexPageParser($)
    case '/torrents.php':
    case '/torrentshd.php':
      return this._torrentPageParser($)
    case '/userdetails.php':
      return this._userPageParser($)
    case '/getusertorrentlist.php':
      return this._seedingPageParser($)
    default:
      return {}
  }
}

moecat._seedingPageParser = function (query) {
  const pagesCount = parseInt(query('script').text().match(/maxpage=(-?\d+)/)[1]) + 1
  let seedingTorrents = []
  if (query('#outer > table').length !== 2) return { pagesCount, seedingTorrents }
  const seedingTable = query('#outer > table').eq(1)
  const tdParserList = [
    {
      name: 'id',
      index: 1,
      parseFunction: p => this._parseTorrentId(p)
    },
    {
      name: 'size',
      index: 2,
      parseFunction: p => this._parseTorrentSize(p)
    }
  ]
  seedingTorrents = this._parseChartTable(seedingTable, tdParserList)
  return { pagesCount, seedingTorrents }
}

moecat._torrentPageParser = function (query) {
  if (/没有种子|沒有種子|Nothing found/.test(query('body').text())) {
    return []
  }
  const torrentList = []
  const table = query('table.torrents').last()
  const trList = table.find('> tbody > tr')
  for (let i = 2; i < trList.length; i += 2) {
    const torrent = {}
    const evenTdList = trList.eq(i).find('> td')
    const oddTdList = trList.eq(i + 1).find('> td')
    // parse category
    torrent.category = this._parseTorrentCategory(evenTdList.eq(0))
    // parse title and id
    torrent.title = this._parseTorrentTitle(evenTdList.eq(1))
    torrent.id = this._parseTorrentId(evenTdList.eq(1))
    // parse subTitle
    torrent.subTitle = this._parseTorrentSubtitle(evenTdList.eq(1))
    // parse tags other than promotion
    torrent.tags = this._parseTorrentTags(evenTdList.eq(1))
    // parse date
    torrent.date = this._parseTorrentDate(oddTdList.eq(1))
    // parse size
    torrent.size = this._parseSize(oddTdList.eq(2).text())
    // parse seeds
    torrent.seeds = parseInt(evenTdList.eq(2).text())
    // parse leeches
    torrent.leeches = parseInt(evenTdList.eq(3).text())
    // parse snatched
    torrent.snatched = parseInt(evenTdList.eq(4).text())
    // parse promotion status
    const promotion = this._parseTorrentPromotion(evenTdList.eq(1))
    if (promotion.type) torrent.tags.push(promotion.type)
    torrent.isFreeleech = promotion.isFreeleech
    torrent.promotionDeadline = promotion.deadline
    // parse status
    const status = this._parseTorrentStatus(trList.eq(i))
    Object.assign(torrent, status)
    // push torrent info into torrentList
    torrentList.push(torrent)
  }
  return torrentList
}

moecat._parseTorrentTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Stick"]').length) tags.push('Sticky')
  if (query.find('span[style*="background-color:#8F77B5"]').length) tags.push('FirstRlease')
  if (query.find('span[style*="background-color:#2F7DB8"]').length) tags.push('Internal')
  if (query.find('span[style*="background-color:#FFAA32"]').length) tags.push('ChineseAudio')
  if (query.find('span[style*="background-color:#91B493"]').length) tags.push('ChineseSubtitles')
  if (query.find('span[style*="background-color:#D74D4D"]').length) tags.push('Exclusive')
  return tags
}

moecat._parseTorrentStatus = function (query) {
  const isActive = !!query.find('td[title="做种中"], td[title="下载中"]').length
  const progress = query.find('td[title="做种中"], td[title="已完成"]').length ? 100 : 0
  return { isActive, progress }
}

module.exports = moecat
