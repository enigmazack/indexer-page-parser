const BaseSite = require('./base-site')

class NexusPhpSite extends BaseSite {
  constructor (config) {
    super(config)
    this.torrentTableIndex = {
      category: 0,
      title: 1,
      date: 3,
      size: 4,
      seeds: 5,
      leeches: 6,
      snatched: 7,
      status: 1
    }
  }

  /**
   * @typedef userBasic
   * @type {object}
   * @property {number} userId - user id
   * @property {string} userName - user name
   * @property {number} unreadMessage - number of unread messages
   */

  /**
   * @typedef userDetails
   * @type {object}
   * @property {string} userClass - user class
   * @property {number} uploadTraffic - upload traffic
   * @property {number} downloadTraffic - download traffic
   * @property {number} bonus - bonus
   * @property {number} joinDate - join date
   * @property {torrentBasic[]} seedingTorrents - list of seeding torrents
   */

  /**
   * @typedef torrentBasic
   * @type {object}
   * @property {number} id - torrent id
   * @property {number} size - torrent size
   */

  /**
   * @typedef torrentPromotion
   * @type {object}
   * @property {boolean} isFreeleech - is freeleech
   * @property {string} type - promotion type
   * @property {number} deadline - promotion deadline
   */

  /**
   * @typedef torrentStatus
   * @type {object}
   * @property {boolean} isActive - is active
   * @property {number} progress - percentage of progress
   */

  /**
   * @typedef torrentDetails
   * @type {object}
   * @property {number} category - category
   * @property {number} id - torrent id
   * @property {string} title - torrent title
   * @property {string} subtitle - torrent subtitle
   * @property {boolean} isFreeleech - is freeleech
   * @property {number} promotionDeadline - promotion deadline
   * @property {string[]} tags - list of tags
   * @property {number} date - torrent release date
   * @property {number} size - torrent size
   * @property {number} seeds - number of seeding peers
   * @property {number} leeches - number of leeching peers
   * @property {number} snatched - number of snatched
   * @property {boolean} isActive - is seeding of leeching
   * @property {number} progress - percentage of progress
   */

  /**
   * The main method, the entry of different pages parser
   * @param {JQueryStatic} $ - the jquery function
   * @param {string} url - the request url
   * @returns {userBasic|userDetails|torrentDetails|seedingPage} parsed results
   */
  pageParser ($, url) {
    const path = new URL(url).pathname
    switch (path) {
      case '/index.php':
        return this._indexPageParser($)
      case '/torrents.php':
        return this._torrentPageParser($)
      case '/userdetails.php':
        return this._userPageParser($)
      case '/getusertorrentlist.php':
        return this._seedingPageParser($)
      default:
        return {}
    }
  }

  /**
   * Index page parser
   * @param {JQueryStatic} $ - jQuery function of the page
   * @returns {userBasic} parsed results
   */
  _indexPageParser ($) {
    // parse user id
    const userQuery = $('a[href*="userdetails.php?id="]').first()
    const userId = parseInt(userQuery.attr('href').match(/id=(\d+)/)[1])
    const userName = userQuery.text()
    // parse unread message
    const unreadMessage = this._parseMessage($('body'))
    return { userId, userName, unreadMessage }
  }

  /**
   * user page parser
   * @param {JQueryStatic} $ - jQuery function of the page
   * @returns {userDetails} parsed results
   */
  _userPageParser ($) {
    const parserList = [
      {
        name: 'userClass',
        keywords: ['等级', '等級', 'Class'],
        parseFunction: q => this._parseUserClass(q)
      },
      {
        name: 'uploadTraffic',
        keywords: ['传输', '傳送', 'Transfers'],
        parseFunction: q => this._parserUploadTraffic(q)
      },
      {
        name: 'downloadTraffic',
        keywords: ['传输', '傳送', 'Transfers'],
        parseFunction: q => this._parserDownloadTraffic(q)
      },
      {
        name: 'bonus',
        keywords: ['魔力', 'Karma', '积分', '積分'],
        parseFunction: q => this._parseBonus(q)
      },
      {
        name: 'joinDate',
        keywords: ['加入日期', 'join'],
        parseFunction: q => this._parseJoinDate(q)
      }
    ]
    const result = this._parsePairwiseTable($('body'), 'td.rowhead', parserList)
    // parse seeding torrents
    result.seedingTorrents = this._parseSeedingTorrents($('#ka1'))
    return result
  }

  /**
   * torrent page parser
   * @param {JQueryStatic} $
   * @returns {torrentDetails[]} list of torrent details information
   */
  _torrentPageParser ($) {
    // return [] if nothing found
    if (/没有种子|沒有種子|Nothing found/.test($('body').text())) {
      return []
    }
    const table = $('table.torrents, table.torrent_list').last()
    const index = this.torrentTableIndex
    const tdParserList = [
      {
        name: 'category',
        index: index.category,
        parseFunction: q => this._parseTorrentCategory(q)
      },
      {
        name: 'id',
        index: index.title,
        parseFunction: q => this._parseTorrentId(q)
      },
      {
        name: 'title',
        index: index.title,
        parseFunction: q => this._parseTorrentTitle(q)
      },
      {
        name: 'subtitle',
        index: index.title,
        parseFunction: q => this._parseTorrentSubtitle(q)
      },
      {
        name: 'tags',
        index: index.tags,
        parseFunction: q => this._parseTorrentTags(q)
      },
      {
        name: 'date',
        index: index.date,
        parseFunction: q => this._parseTorrentDate(q)
      },
      {
        name: 'size',
        index: index.size,
        parseFunction: q => this._parseTorrentSize(q)
      },
      {
        name: 'seeds',
        index: index.seeds,
        parseFunction: q => parseInt(q.text())
      },
      {
        name: 'leeches',
        index: index.leeches,
        parseFunction: q => parseInt(q.text())
      },
      {
        name: 'snatched',
        index: index.snatched,
        parseFunction: q => parseInt(q.text())
      },
      {
        name: 'promotion',
        index: index.title,
        parseFunction: q => this._parseTorrentPromotion(q)
      },
      {
        name: 'status',
        index: index.status,
        parseFunction: q => this._parseTorrentStatus(q)
      }
    ]
    const torrentList = this._parseChartTable(table, tdParserList)
    // flatten torrentList
    torrentList.forEach(torrent => {
      if (torrent.promotion.type) torrent.tags.push(torrent.promotion.type)
      torrent.isFreeleech = torrent.promotion.isFreeleech
      torrent.promotionDeadline = torrent.promotion.deadline
      torrent.isActive = torrent.status.isActive
      torrent.progress = torrent.status.progress
      delete torrent.promotion
      delete torrent.status
    })
    return torrentList
  }

  /**
   * @typedef seedingPage
   * @type {object}
   * @property {number} pagesCount
   * @property {torrentBasic[]} seedingTorrents
   */

  /**
   * Seeding torrent page parser
   * @param {JQueryStatic} $
   * @returns {seedingPage} list of seeding torrents and pages count
   */
  _seedingPageParser () {
    /** @type {seedingPage} */
    const result = { pagesCount: 0, seedingTorrents: [] }
    return result
  }

  /**
   * message number parser
   * @param {JQuery} query - query contains message info
   * @returns {number} number of unread messages
   */
  _parseMessage (query) {
    const messageQuery = query.find('a[href*="messages.php"]').first().parent()
    return parseInt(messageQuery.text().match(/\((\d+).+(新|New)\)/)[1])
  }

  /**
   * User class parser
   * @param {JQuery} query
   * @returns {string} user class
   */
  _parseUserClass (query) {
    return query.find('img').attr('title')
  }

  /**
   * Upload traffic parser
   * @param {JQuery} query
   * @returns {number} - bytes of upload traffic
   */
  _parserUploadTraffic (query) {
    const traffic = query.text().match(/(上[传傳]量|Uploaded).+?([\d.]+ ?[ZEPTGMK]?B)/)[2]
    return this._parseSize(traffic)
  }

  /**
   * Download traffic parser
   * @param {JQuery} query
   * @returns {number} - bytes of download traffic
   */
  _parserDownloadTraffic (query) {
    const traffic = query.text().match(/(下[载載]量|Downloaded).+?([\d.]+ ?[ZEPTGMK]?B)/)[2]
    return this._parseSize(traffic)
  }

  /**
   * Join date parser
   * @param {JQuery} query
   * @returns {number} - timestamp of user join date
   */
  _parseJoinDate (query) {
    const joinDate = query.text().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[0]
    return new Date(joinDate).getTime()
  }

  /**
   * Bonus parser
   * @param {JQuery} query
   * @returns {number} bonus
   */
  _parseBonus (query) {
    return this._parseNumber(query.text())
  }

  /**
   * Seeding torrents parser
   * @param {JQuery} query
   * @returns {torrentBasic[]} list of seeding torrents with id and size
   */
  _parseSeedingTorrents (query) {
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
    return this._parseChartTable(query.find('table'), tdParserList)
  }

  /**
   * Torrent id parser
   * @param {JQuery} query
   * @returns {number} torrent id
   */
  _parseTorrentId (query) {
    const id = query.find('a[href*="details.php?id="]').attr('href').match(/id=(\d+)/)[1]
    return parseInt(id)
  }

  /**
   * Torrent size parser
   * @param {JQuery} query
   * @returns {number} bytes of torrent size
   */
  _parseTorrentSize (query) {
    return this._parseSize(query.text())
  }

  /**
   * Torrent promotion parser
   * @param {JQuery} query
   * @returns {torrentPromotion} torrent promotion information
   */
  _parseTorrentPromotion (query) {
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
    const dateMatch = query.html().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
    const deadline = dateMatch ? new Date(dateMatch[0]).getTime() : 0
    return { isFreeleech, type, deadline }
  }

  /**
   * Torrent status parser
   * @param {JQuery} query
   * @returns {torrentStatus} torrent status information
   */
  _parseTorrentStatus () {
    return { isActive: false, progress: 0 }
  }

  /**
   * Torrent tags parser
   * @param {JQuery} query
   * @returns {string[]} list of tags
   */
  _parseTorrentTags (query) {
    const tags = []
    if (query.find('img[alt*="Stick"]').length) tags.push('Sticky')
    return tags
  }

  /**
   * Torrent title parser
   * @param {JQuery} query
   * @returns {string} torrent title
   */
  _parseTorrentTitle (query) {
    return query.find('a[href*="details.php?id="]').attr('title')
  }

  /**
   * Torrent subtitle parser
   * @param {JQuery} query
   * @returns {string} torrent subtitle
   */
  _parseTorrentSubtitle (query) {
    const SubtitleQuery = query.find('a[href*="details.php?id="]').last().parent()
    return SubtitleQuery.html().split('>').pop()
  }

  /**
   * Torrent date parser
   * @param {JQuery} query
   * @returns {number} timestamp of torrent release date
   */
  _parseTorrentDate (query) {
    return new Date(query.find('> span').attr('title')).getTime()
  }

  /**
   * Torrent category parser
   * @param {JQuery} query
   * @returns {number} category number
   */
  _parseTorrentCategory (query) {
    const category = query.find('a[href*="?cat="]').attr('href').match(/cat=(\d+)/)[1]
    return parseInt(category)
  }
}

module.exports = NexusPhpSite
