const NexusPhpSite = require('../models/nexusphp-site')

const ptSJTU = new NexusPhpSite({
  name: 'pt.sjtu.edu.cn'
})

ptSJTU._parseMessage = function () {
  // TODO
  return 0
}

ptSJTU._parsePromotion = function (query) {
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
  if (type) promotion.type = type
  const deadlineQuery = query.find('font[style="color:#38ACEC"]')
  if (deadlineQuery.length) {
    promotion.deadline = this._parseTime(deadlineQuery.text().split(':')[1])
  }
  return promotion
}

ptSJTU._parseTime = function (timeString) {
  const timeMatch = timeString.match(/\d+[分时天月年]/g)
  let length = 0
  timeMatch.forEach(time => {
    const timeMatch = time.match(/(\d+)([分时天月年])/)
    const number = parseInt(timeMatch[1])
    const unit = timeMatch[2]
    switch (true) {
      case unit === '分':
        length += number
        break
      case unit === '时':
        length += number * 60
        break
      case unit === '天':
        length += number * 60 * 24
        break
      case unit === '月':
        length += number * 60 * 24 * 30
        break
      case unit === '年':
        length += number * 60 * 24 * 365
        break
      default:
    }
  })
  return Date.now() - length * 60 * 1000
}

ptSJTU._parseDate = function (query) {
  return this._parseTime(query.text())
}

// ptSJTU._parseTags = function (query) {
//   const tags = []
//   if (query.find('img[alt*="Sticky"]').length) tags.push('Sticky')
//   if (query.find('img.subicon').length) tags.push('ChineseSubtitles')
// }

module.exports = ptSJTU
