const BaseSite = require('./base-site')

class NexusPhpSite extends BaseSite {
  // constructor (config) {
  //   super(config)
  // }

  pageParser (query, url) {
    const path = new URL(url).pathname
    switch (path) {
      case '/index.php':
        return this._indexPageParser(query)
      case '/torrents.php':
        return this._torrentPageParser(query)
      case '/userdetails.php':
        return this._userPageParser(query)
      default:
        return {}
    }
  }

  _indexPageParser (query) {
    // parse user id
    const userQuery = query('a[href*="userdetails.php?id="]').first()
    const userId = parseInt(userQuery.attr('href').match(/id=(\d+)/)[1])
    const userName = userQuery.text()
    // parse unread message
    const unreadMessage = this._parseMessage(query)
    return {
      userId,
      userName,
      unreadMessage
    }
  }

  _parseMessage (query) {
    const messageQuery = query('a[href*="messages.php"]').first().parent()
    return parseInt(messageQuery.text().match(/\((\d+).+(新|New)\)/)[1])
  }

  _userPageParser (query) {
    // parse user class
    const classQuery = query(
      'td.rowhead:contains("等级"), td.rowhead:contains("等級"), td.rowhead:contains("Class")'
    ).next().find('img')
    const userClass = classQuery.attr('title')
    // parse upload/download traffic
    const ratioQuery = query(
      'td.rowhead:contains("传输"), td.rowhead:contains("傳送"), td.rowhead:contains("Transfers")'
    ).next()
    let uploadTraffic = ratioQuery.text().match(/(上[传傳]量|Uploaded).+?([\d.]+ ?[ZEPTGMK]?B)/)[2]
    uploadTraffic = this._parseSize(uploadTraffic)
    let downloadTraffic = ratioQuery.text().match(/(下[载載]量|Downloaded).+?([\d.]+ ?[ZEPTGMK]?B)/)[2]
    downloadTraffic = this._parseSize(downloadTraffic)
    // parse bonus
    const bonusQuery = this._queryAny(query('body'), [
      'td.rowhead:contains("魔力")',
      'td.rowhead:contains("Karma")',
      'td.rowhead:contains("积分")',
      'td.rowhead:contains("積分")'
    ]).next()
    const bonus = this._parseBonus(bonusQuery)
    // parse join date
    const joinDateQuery = query(
      'td.rowhead:contains("加入日期"), td.rowhead:contains("Join")'
    ).next()
    let joinDate = joinDateQuery.text().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[0]
    joinDate = new Date(joinDate).getTime()
    // parse seeding torrents
    const seedingTorrentsQuery = query('#ka1')
    const seedingTorrents = this._parseSeedingTorrents(seedingTorrentsQuery)
    return {
      // userName,
      userClass,
      uploadTraffic,
      downloadTraffic,
      bonus,
      joinDate,
      seedingTorrents
    }
  }

  _parseBonus (query) {
    return this._parseNumber(query.text())
  }

  _parseSeedingTorrents (query) {
    if (query.find('table').length === 0) {
      return []
    }
    const torrentList = []
    const table = query.find('table')
    const trList = table.find('> tbody > tr')
    const index = { title: 1, size: 2 }
    for (let i = 1; i < trList.length; i++) {
      const torrent = {}
      const tdList = trList.eq(i).find('> td')
      const titleQuery = tdList.eq(index.title).find('a[href*="details.php?id="]')
      torrent.id = parseInt(titleQuery.attr('href').match(/id=(\d+)/)[1])
      torrent.size = this._parseSize(tdList.eq(index.size).text())
      torrentList.push(torrent)
    }
    return torrentList
  }

  _torrentPageParser (query) {
    // return [] if nothing found
    if (/没有种子|沒有種子|Nothing found/.test(query('body').text())) {
      return []
    }
    const torrentList = []
    const table = query('table.torrents, table.torrent_list').last()
    const trList = table.find('> tbody > tr')
    const tdLength = trList.eq(1).find('> td').length
    const index = this._getTorrentTableIndex(tdLength)
    for (let i = 1; i < trList.length; i++) {
      const torrent = {}
      const tdList = trList.eq(i).find('> td')
      // parse category
      const categoryQuery = tdList.eq(index.category).find('a[href*="?cat="]')
      torrent.category = parseInt(categoryQuery.attr('href').match(/cat=(\d+)/)[1])
      // parse title and id
      const titleQuery = tdList.eq(index.title).find('a[href*="details.php?id="]')
      torrent.title = titleQuery.attr('title')
      torrent.id = parseInt(titleQuery.attr('href').match(/id=(\d+)/)[1])
      // parse subTitle
      torrent.subTitle = this._parseSubTitle(tdList.eq(index.title))
      // parse promotion status
      const promotion = this._parsePromotion(tdList.eq(index.title))
      torrent.isFreeleech = promotion.isFreeleech
      torrent.promotionDeadline = promotion.deadline || 0
      // parse tags other than promotion
      const tags = this._parseTags(tdList.eq(index.title))
      if ({}.hasOwnProperty.call(promotion, 'type')) {
        tags.push(promotion.type)
      }
      torrent.tags = tags
      // parse date
      torrent.date = this._parseDate(tdList.eq(index.date))
      // parse size
      torrent.size = this._parseSize(tdList.eq(index.size).text())
      // parse seeds
      torrent.seeds = parseInt(tdList.eq(index.seeds).text())
      // parse leeches
      torrent.leeches = parseInt(tdList.eq(index.leeches).text())
      // parse snatched
      torrent.snatched = parseInt(tdList.eq(index.snatched).text())
      // parse status
      const status = this._parseStatus(tdList, index)
      Object.assign(torrent, status)
      // push torrent info into torrentList
      torrentList.push(torrent)
    }
    return torrentList
  }

  _parseDate (query) {
    const dateQuery = query.find('> span')
    return new Date(dateQuery.attr('title')).getTime()
  }

  _getTorrentTableIndex (tdLength) {
    return {
      category: 0,
      title: 1,
      comments: 2,
      date: 3,
      size: 4,
      seeds: 5,
      leeches: 6,
      snatched: 7,
      status: tdLength - 2,
      uploader: tdLength - 1
    }
  }

  _parseStatus (query, index) {
    if ({}.hasOwnProperty.call(index, 'status')) {
      const text = query.eq(index.status).text()
      const isActive = /peer-active/.test(query.eq(index.status).attr('class'))
      const progress = /-/.test(text) ? 0 : parseFloat(text)
      return {
        isActive,
        progress
      }
    } else {
      return {
        isActive: false,
        progress: 0
      }
    }
  }

  _parseSubTitle (query) {
    const subTitleQuery = query.find('a[href*="details.php?id="]').last().parent()
    return subTitleQuery.html().split('>').pop()
  }

  _parseTags (query) {
    const tags = []
    if (query.find('img[alt*="Stick"]').length) tags.push('Sticky')
    return tags
  }

  _parsePromotion (query) {
    const promotion = {}
    let type = ''
    let isFreeleech = false
    switch (true) {
      case !!query.find('img.pro_free').length:
        type = 'Free'
        isFreeleech = true
        break
      case !!query.find('img.pro_free2up').length:
        type = '2xFree'
        isFreeleech = true
        break
      case !!query.find('img.pro_2up').length:
        type = '2xUp'
        break
      case !!query.find('img.pro_50pctdown2up').length:
        type = '2x50%'
        break
      case !!query.find('img.pro_30pctdown').length:
        type = '30%'
        break
      case !!query.find('img.pro_50pctdown').length:
        type = '50%'
        break
      default:
    }
    promotion.isFreeleech = isFreeleech
    if (type) {
      promotion.type = type
    }
    const dateMatch = query.html().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
    if (dateMatch) {
      promotion.deadline = new Date(dateMatch[0]).getTime()
    }
    return promotion
  }
}

module.exports = NexusPhpSite
