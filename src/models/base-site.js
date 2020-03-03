class BaseSite {
  constructor (config) {
    this.name = config.name || ''
  }

  _parseNumber (numberString) {
    return parseFloat(numberString.replace(/[, ]/g, ''))
  }

  _parseSize (sizeString) {
    const sizeMatch = sizeString.match(/^(\d*\.?\d+)(.*[^ZEPTGMK])?([ZEPTGMK](B|iB))$/i)
    if (sizeMatch) {
      const sizeNum = parseFloat(sizeMatch[1])
      const sizeType = sizeMatch[3]
      switch (true) {
        case /Zi?B/i.test(sizeType):
          return Math.round(sizeNum * Math.pow(2, 70))
        case /Ei?B/i.test(sizeType):
          return Math.round(sizeNum * Math.pow(2, 60))
        case /Pi?B/i.test(sizeType):
          return Math.round(sizeNum * Math.pow(2, 50))
        case /Ti?B/i.test(sizeType):
          return Math.round(sizeNum * Math.pow(2, 40))
        case /Gi?B/i.test(sizeType):
          return Math.round(sizeNum * Math.pow(2, 30))
        case /Mi?B/i.test(sizeType):
          return Math.round(sizeNum * Math.pow(2, 20))
        case /Ki?B/i.test(sizeType):
          return Math.round(sizeNum * Math.pow(2, 10))
        default:
          return Math.round(sizeNum)
      }
    }
    return 0
  }

  _booleanParser (query, selector) {
    return !!query.find(selector).length
  }

  _queryAny (query, selectorList) {
    // this function will return the first non-empty result of the selectors
    // or the last one
    for (let i = 0; i < selectorList.length; i++) {
      if (query.find(selectorList[i]).length > 0) {
        return query.find(selectorList[i])
      }
    }
    return query.find(selectorList[selectorList.length - 1])
  }
}

module.exports = BaseSite
