const NexusPhpSite = require('../models/nexusphp-site')

const mteam = new NexusPhpSite({
  name: 'pt.m-team.cc'
})

mteam._seedingPageParser = function (query) {
  let pagesCount = 0
  const seedingTorrents = []
  if (query('table.main').length === 1) return { pagesCount, seedingTorrents }
  const mainTable = query('table.main').eq(1)
  const countQuery = mainTable.find('> tbody > tr > td > p').first()
  pagesCount = countQuery.find('a[href*="&page="]').length
    ? parseInt(countQuery.find('a[href*="&page="]').last().attr('href').match(/page=(\d+)/)[1]) + 1
    : 1
  const seedingTable = mainTable.find('> tbody > tr > td > table')
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

mteam.pageParser = function (query, url) {
  const path = new URL(url).pathname
  switch (path) {
    case '/index.php':
      return this._indexPageParser(query)
    case '/torrents.php':
    case '/movie.php':
    case '/adult.php':
      return this._torrentPageParser(query)
    case '/userdetails.php':
      return this._userPageParser(query)
    case '/getusertorrentlist.php':
      return this._seedingPageParser(query)
    default:
      return {}
  }
}

module.exports = mteam
