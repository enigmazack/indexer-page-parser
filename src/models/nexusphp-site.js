const BaseSite = require('./base-site')

class NexusPhpSite extends BaseSite {
  constructor (config) {
    super(config)
  }

  pageParser (query, url) {
    const path = new URL(url).pathname
    switch (path) {
      case '/index.php':
        return this._indexPageParser(query)
      case '/torrents.php':
        return this._torrentPageParser(query)
      case '/userdetails.php':
        return this._userPageParser(query)
      // case '/getusertorrentlistajax.php':
      //   return this._seedingPageParser(query)
      default:
        return {}
    }
  }

  _indexPageParser (query) {
    const userQuery = query('a[href*="userdetails.php?id="]').first()
    // const userName = userQuery.text()
    const userId = parseInt(userQuery.attr('href').match(/id=(\d+)/)[1])
    return { userId }
  }

  _userPageParser (query) {
    // parse user name
    const userQuery = query('a[href*="userdetails.php?id="]').first()
    const userName = userQuery.text()
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
    const bonusQuery = query(
      'td.rowhead:contains("魔力"), td.rowhead:contains("Karma")'
    ).next()
    const bonus = parseFloat(bonusQuery.text())
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
      userName,
      userClass,
      uploadTraffic,
      downloadTraffic,
      bonus,
      joinDate,
      seedingTorrents
    }
  }

  _parseSeedingTorrents (query) {
    // seeding torrent table is similar to torrent table of page
    // refer to this._torrentPageParser
    if (query.find('table').length == 0) {
      return []
    }
    const torrentList = []
    const table = query.find('table')
    const trList = table.find('> tbody > tr')
    const index = this._parseTableHead(trList.eq(0))
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
    const table = query('table.torrents:last')
    const trList = table.find('> tbody > tr')
    const index = this._parseTableHead(trList.eq(0))
    for (let i = 1; i < trList.length; i++) {
      const torrent = {}
      const tdList = trList.eq(i).find('> td')
      // parse category
      const categoryQuery = tdList.eq(index.category).find('a[href*="?cat="]')
      torrent.category = parseInt(categoryQuery.attr('href').match(/cat=(\d+)/)[1])
      // parse title and id
      const titleQuery = tdList.eq(index.title).find('a[href*="details.php?id="]')
      torrent.title = titleQuery.attr('title')
      torrent.id = titleQuery.attr('href').match(/id=(\d+)/)[1]
      // parse subTitle
      torrent.subTitle = this._parseSubTitle(tdList.eq(index.title))
      // parse promotion status
      const promotion = this._parsePromotion(tdList.eq(index.title))
      torrent.isFreeleech = promotion.isFreeleech
      if (promotion.hasOwnProperty('deadline')) {
        torrent.promotionDeadline = promotion.deadline
      }        
      // parse tags other than promotion
      const tags = this._parseTags(tdList.eq(index.title))
      if (promotion.hasOwnProperty('type')) {
        tags.push(promotion.type)
      }
      torrent.tags = tags
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
      // parse status
      let status = {}
      if (index.hasOwnProperty('status')) {
        status = this._parseStatusDefault(tdList.eq(index.status))
      } else {
        status = this._parseStatus(tdList.eq(index.title))
      }
      Object.assign(torrent, status)
      // push torrent info into torrentList
      torrentList.push(torrent)
    }
    return torrentList
  }

  _parseStatusDefault (query) {
    const isActive = /peer-active/.test(query.attr('class'))
    const progress = /--/.test(query.text()) ? 0 : parseFloat(query.text())
    let status = ''
    if (isActive) {
      status = progress == 100 ? 'Seeding' : 'Leeching'
    } else {
      status = progress == 100 ? 'Snatched' : 'Stopped'
    }
    return { status, progress }
  }

  _parseStatus (query) {
    return { status: '', progress: 0}
  }

  _parseSubTitle (query) {
    const subTitleQuery = query.find('a[href*="details.php?id="]').parent()
    return subTitleQuery.html().split('>').pop()
  }

  _parseTags (query) {
    return []
  }

  _parsePromotion (query) {
    const promotion = {}
    let type = ''
    let isFreeleech = false
    switch (true) {
      case this._booleanParser(query, 'img.pro_free'):
        type = 'Free'
        isFreeleech = true
        break
      case this._booleanParser(query, 'img.pro_free2up'):
        type = '2xFree'
        isFreeleech = true
        break
      case this._booleanParser(query, 'img.pro_2up'):
        type = '2xUp'
        break
      case this._booleanParser(query, 'img.pro_50pctdown2up'):
        type = '2x50%'
        break
      case this._booleanParser(query, 'img.pro_30pctdown'):
        type = '30%'
        break
      case this._booleanParser(query, 'img.pro_50pctdown'):
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

  _parseTableHead (query) {
    // parse table head to get index of different columns
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
        default:
      }
    }
    return index
  }

  _seedingPageParser (query) {

  }
}

module.exports = NexusPhpSite
