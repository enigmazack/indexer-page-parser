const NexusPhpSite = require('../models/nexusphp-site')

const ptSJTU = new NexusPhpSite({
  name: 'pt.sjtu.edu.cn'
})

ptSJTU._parseMessage = function () {
  // TODO
  return 0
}

ptSJTU._parseTorrentPromotion = function (query) {
  const promotion = {}
  let isFreeleech = false
  let type = ''
  switch (query.parent().attr('class')) {
    case 'free_bg':
      isFreeleech = true
      type = 'Free'
      break
    case 'twoup_bg':
      type = '2xUp'
      break
    case 'halfdown_bg':
      type = '50%'
      break
    case 'd30down_bg':
      type = '30%'
      break
    case 'd70down_bg':
      type = '70%'
      break
    default:
  }
  promotion.isFreeleech = isFreeleech
  promotion.type = type
  const deadlineQuery = query.find('font[style="color:#38ACEC"]')
  promotion.deadline = deadlineQuery.length
    ? this._parseTime(deadlineQuery.text().split(':')[1])
    : 0
  return promotion
}

ptSJTU._parseTorrentDate = function (query) {
  return Date.now() - this._parseTime(query.text())
}

module.exports = ptSJTU
