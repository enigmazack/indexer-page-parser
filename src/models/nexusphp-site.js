const BaseSite = require('./base-site')

class NexusPhpSite extends BaseSite {
  constructor(config) {
    super(config)
  }

  pageParser(query, url) {
    const path = new URL(url).pathname
    switch (path) {
      case '/index.php':
        return this._indexPageParser(query)
      case '/torrents.php':
        return this._torrentPageParser(query)
      case '/userdetails.php':
        return this._userPageParser(query)
      case '/getusertorrentlistajax.php':
        return this._seedingPageParser(query)
      default:
        return {}
    }
  }

  _indexPageParser(query) {
    const userQuery = query('a[href*="userdetails.php?id="]').first()
    // const userName = userQuery.text()
    const userId = userQuery.attr('href').match(/id=(\d+)/)[1]
    return { userId }
  }

  _userPageParser(query) {
    // parse user name
    const userQuery = query('a[href*="userdetails.php?id="]').first()
    const userName = userQuery.text()
    // parse user class
    const classQuery = this._queryAny(query, [
      'td.rowhead:contains("等级")',
      'td.rowhead:contains("等級")',
      'td.rowhead:contains("Class")'
    ]).next().find('img')
    const userClass = classQuery.attr('title')
    // parse upload/download traffic
    const ratioQuery = this._queryAny(query, [
      'td.rowhead:contains("传输")',
      'td.rowhead:contains("傳送")',
      'td.rowhead:contains("Transfers")'
    ]).next()
    let uploadTraffic = ratioQuery.text().match(/(上[传傳]量|Uploaded).+?([\d.]+ ?[ZEPTGMK]?B)/)[2]
    uploadTraffic = this._parseSize(uploadTraffic)
    let downloadTraffic = ratioQuery.text().match(/(下[载載]量|Downloaded).+?([\d.]+ ?[ZEPTGMK]?B)/)[2]
    downloadTraffic = this._parseSize(downloadTraffic)
    // parse bonus
    const bonusQuery = this._queryAny(query, [
      'td.rowhead:contains("魔力")',
      'td.rowhead:contains("Karma")'
    ]).next()
    const bonus = parseFloat(bonusQuery.text())
    // parse join date
    const joinDateQuery = this._queryAny(query, [
      'td.rowhead:contains("加入日期")',
      'td.rowhead:contains("Join")'
    ]).next()
    let joinDate = joinDateQuery.text().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[0]
    joinDate = new Date(joinDate).getTime()
    return {
      userName,
      userClass,
      uploadTraffic,
      downloadTraffic,
      bonus,
      joinDate
    }
  }

  _torrentPageParser(query) {
    // return [] if nothing found
    if (/没有种子|沒有種子|Nothing found/.test(query('body').text())) {
      return []
    }
    const torrentList = []
    const table = query('table.torrents:last')
    const trList = table.find('> tbody > tr')
    const index = this._parseTableHead(trList.eq(0))
    for (let i = 1; i < trList.length; i++) {
      const torrent = {}
      const tdList = trList.eq(i).find('> td')
      // parse category
      const categoryQuery = tdList.eq(index.category).find('a[href*="?cat="]')
      torrent.category = parseInt(categoryQuery.attr('href').match(/cat=(\d+)/)[1])
      // parse title and many other info
      const parseResults = this._parseTitle(tdList.eq(index.title))
      Object.assign(torrent, parseResults)
      // parse date
      const dateQuery = tdList.eq(index.date).find('> span')
      torrent.date = new Date(dateQuery.attr('title')).getTime()
      // parse size
      torrent.size = this._parseSize(tdList.eq(index.size).text())
      // parse seeds
      torrent.seeds = parseInt(tdList.eq(index.seeds).text())
      // parse leeches
      torrent.leeches = parseInt(tdList.eq(index.leeches).text())
      // parse snatched
      torrent.snatched = parseInt(tdList.eq(index.snatched).text())
      // push torrent info into torrentList
      torrentList.push(torrent)
    }
    return torrentList
  }

  _parseTitle(query) {
    const titleQuery = query.find('a[href*="details.php?id="]')
    const title = titleQuery.attr('title')
    const id = titleQuery.attr('href').match(/id=(\d+)/)[1]
    const isFree
  }

  _parseTableHead(query) {
    const tdList = query.find('> td')
    const index = {}
    for (let i = 0; i < tdList.length; i++) {
      switch (true) {
        case /(类型|類型|Type)/.test(tdList.eq(i).text()):
          index.category = i
          break
        case /(标题|標題|Name)/.test(tdList.eq(i).text()):
          index.title = i
          break
        case /(进度|進度|DL%)/.test(tdList.eq(i).text()):
          index.status = i
          break
        // case  tdList.eq(i).find('img.comments').length == 1:
        //   index.comments = i
        //   break
        case tdList.eq(i).find('img.time').length == 1:
          index.date = i
          break
        case tdList.eq(i).find('img.size').length == 1:
          index.size = i
          break
        case tdList.eq(i).find('img.seeders').length == 1:
          index.seeds = i
          break
        case tdList.eq(i).find('img.leechers').length == 1:
          index.leeches = i
          break
        case tdList.eq(i).find('img.snatched').length == 1:
          index.snatched = i
          break
      }
    }
    return index
  }
}

module.exports = NexusPhpSite
