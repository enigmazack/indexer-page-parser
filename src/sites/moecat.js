const NexusPhpSite = require('../models/nexusphp-site')

const moecat = new NexusPhpSite({
  name: 'moecat.bast'
})

moecat._indexPageParser = function (query) {
  // parse user id
  const userQuery = query('a[href*="userdetails.php?id="]').first()
  const userId = parseInt(userQuery.attr('href').match(/id=(\d+)/)[1])
  // skip parse unread message
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

module.exports = moecat
