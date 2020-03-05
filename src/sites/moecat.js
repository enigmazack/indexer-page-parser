const NexusPhpSite = require('../models/nexusphp-site')

const moecat = new NexusPhpSite({
  name: 'moecat.bast'
})

moecat._indexPageParser = function (query) {
  // parse user id
  const userQuery = query('a[href*="userdetails.php?id="]').first()
  const userId = parseInt(userQuery.attr('href').match(/id=(\d+)/)[1])
  // TODO: parse unread message
  return {
    userId,
    unreadMessage: 0
  }
}

moecat.pageParser = function (query, url) {
  const path = new URL(url).pathname
  switch (path) {
    case '/index.php':
      return this._indexPageParser(query)
    case '/torrents.php':
      return this._torrentPageParser(query)
    case '/userdetails.php':
      return this._userPageParser(query)
    case '/getusertorrentlist.php':
      return this._seedingPageParser(query)
    default:
      return {}
  }
}

moecat._seedingPageParser = function (query) {
  const pagesCount = parseInt(query('script').text().match(/maxpage=(-?\d+)/)[1]) + 1
  const seedingTorrents = []
  if (query('#outer > table').length !== 2) return { pagesCount, seedingTorrents }
  const seedingTable = query('#outer > table').eq(1)
  const trList = seedingTable.find('> tbody > tr')
  for (let i = 1; i < trList.length; i++) {
    const torrent = {}
    const tdList = trList.eq(i).find('> td')
    const idQuery = tdList.eq(1).find('a[href*="details.php?id="]')
    torrent.id = parseInt(idQuery.attr('href').match(/id=(\d+)/)[1])
    const sizeQuery = tdList.eq(2)
    torrent.size = this._parseSize(sizeQuery.text())
    seedingTorrents.push(torrent)
  }
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
    const categoryQuery = evenTdList.eq(0).find('a[href*="?cat="]')
    torrent.category = parseInt(categoryQuery.attr('href').match(/cat=(\d+)/)[1])
    // parse title and id
    const titleQuery = evenTdList.eq(1).find('a[href*="details.php?id="]')
    torrent.title = titleQuery.attr('title')
    torrent.id = parseInt(titleQuery.attr('href').match(/id=(\d+)/)[1])
    // parse subTitle
    torrent.subTitle = this._parseSubTitle(evenTdList.eq(1))
    // parse promotion status
    const promotion = this._parsePromotion(evenTdList.eq(1))
    torrent.isFreeleech = promotion.isFreeleech
    torrent.promotionDeadline = promotion.deadline || 0
    // parse tags other than promotion
    const tags = this._parseTags(evenTdList.eq(1))
    if ({}.hasOwnProperty.call(promotion, 'type')) {
      tags.push(promotion.type)
    }
    torrent.tags = tags
    // parse date
    torrent.date = this._parseDate(oddTdList.eq(1))
    // parse size
    torrent.size = this._parseSize(oddTdList.eq(2).text())
    // parse seeds
    torrent.seeds = parseInt(evenTdList.eq(2).text())
    // parse leeches
    torrent.leeches = parseInt(evenTdList.eq(3).text())
    // parse snatched
    torrent.snatched = parseInt(evenTdList.eq(4).text())
    // TODO: parse status
    const status = this._parseStatus(trList.eq(i))
    Object.assign(torrent, status)
    // push torrent info into torrentList
    torrentList.push(torrent)
  }
  return torrentList
}

moecat._parseTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Stick"]').length) tags.push('Sticky')
  if (query.find('span[style*="background-color:#8F77B5"]').length) tags.push('FirstRlease')
  if (query.find('span[style*="background-color:#2F7DB8"]').length) tags.push('Internal')
  if (query.find('span[style*="background-color:#FFAA32"]').length) tags.push('ChineseAudio')
  if (query.find('span[style*="background-color:#91B493"]').length) tags.push('ChineseSubtitles')
  if (query.find('span[style*="background-color:#D74D4D"]').length) tags.push('Exclusive')
  return tags
}

moecat._parseStatus = function (query) {
  const isActive = !!query.find('td[title="做种中"], td[title="下载中"]').length
  const progress = query.find('td[title="做种中"], td[title="已完成"]').length
    ? 100 : 0
  return {
    isActive,
    progress
  }
}
module.exports = moecat
