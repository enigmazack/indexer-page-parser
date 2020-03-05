const NexusPhpSite = require('../models/nexusphp-site')

const mteam = new NexusPhpSite({
  name: 'pt.m-team.cc'
})

mteam._seedingPageParser = function (query) {
  // -1 bug
  const countString = query('script').text().match(/maxpage=(-?\d+)/)[1]
  const pagesCount = countString === '18446744073709551615' ? 0 : parseInt(countString) + 1
  const seedingTorrents = []
  const seedingTable = query('#outer > table > tbody > tr > td > table')
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

mteam._parseTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('img.label_diy').length) tags.push('DIY')
  if (query.find('img.label_dub').length) tags.push('ChineseAudio')
  if (query.find('img.label_sub').length) tags.push('ChineseSubtitles')
  return tags
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
