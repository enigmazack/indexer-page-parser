const NexusPhpSite = require('../models/nexusphp-site')

const mteam = new NexusPhpSite({
  name: 'pt.m-team.cc'
})

mteam.pageParser = function ($, url) {
  const path = new URL(url).pathname
  switch (path) {
    case '/index.php':
      return this._indexPageParser($)
    case '/torrents.php':
    case '/movie.php':
    case '/adult.php':
      return this._torrentPageParser($)
    case '/userdetails.php':
      return this._userPageParser($)
    case '/getusertorrentlist.php':
      return this._seedingPageParser($)
    default:
      return {}
  }
}

mteam._seedingPageParser = function ($) {
  // -1 bug
  const countString = $('script').text().match(/maxpage=(-?\d+)/)[1]
  const pagesCount = countString === '18446744073709551615' ? 0 : parseInt(countString) + 1
  const seedingTable = $('#outer > table > tbody > tr > td > table')
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
  const seedingTorrents = this._parseChartTable(seedingTable, tdParserList)
  return { pagesCount, seedingTorrents }
}

mteam.torrentTableIndex.status = 8

mteam._parseTorrentStatus = function (query) {
  const isActive = /peer-active/.test(query.attr('class'))
  const progress = /-/.test(query.text()) ? 0 : parseFloat(query.text())
  return { isActive, progress }
}

mteam._parseTorrentTags = function (query) {
  const tags = []
  if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
  if (query.find('img.label_diy').length) tags.push('DIY')
  if (query.find('img.label_dub').length) tags.push('ChineseAudio')
  if (query.find('img.label_sub').length) tags.push('ChineseSubtitles')
  return tags
}

module.exports = mteam
