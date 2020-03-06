class BaseSite {
  constructor (config) {
    this.name = config.name || ''
  }

  /**
   * Parse number string with comma and/or space
   * @param {string} numberString - number string to be parsed
   * @returns {number} parsed number
   */
  _parseNumber (numberString) {
    return parseFloat(numberString.replace(/[, ]/g, ''))
  }

  /**
   * Parse size string into bytes
   * @param {string} sizeString - size string to be parsed
   * @returns {number} parsed size
   */
  _parseSize (sizeString) {
    const sizeMatch = sizeString.match(/^(\d*\.?\d+)(.*[^ZEPTGMK])?([ZEPTGMK](B|iB))$/i)
    if (sizeMatch) {
      const sizeNum = parseFloat(sizeMatch[1])
      const sizeType = sizeMatch[3]
      switch (true) {
        // note that Number.MAX_SAFE_INTEGER is (1n << 53n) - 1n
        // so size >= 8 PB will parse into an approximate value
        // however, it is acceptable for our application
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

  /**
   * A query helper, expect to return the first non-empty result of the selectors
   * @param {JQuery} query - jQuery object
   * @param {string[]} selectorList - list of selectors
   * @returns {JQuery} query result
   */
  _queryAny (query, selectorList) {
    for (let i = 0; i < selectorList.length; i++) {
      if (query.find(selectorList[i]).length) {
        return query.find(selectorList[i])
      }
    }
    return query.find(selectorList[selectorList.length - 1])
  }

  /**
   * @typedef pairwiseParser
   * @type {object}
   * @property {string} name - name of the parser
   * @property {string|string[]} key - content of selector
   * @property {function} parseFunction - parse function to get the value
   */

  /**
   * parse table with only two columns like
   * key1 | value1
   * key2 | value2
   * ...
   * @param {JQuery} query - outer query object
   * @param {string} selector - selector of the key column
   * @param {pairwiseParser[]} parserList - list of pairwiseParser
   */
  _parsePairwiseTable (query, selector, parserList) {
    const result = {}
    parserList.forEach(parser => {
      if (!Array.isArray(parser.key)) parser.key = [parser.key]
      const selectorList = []
      parser.key.forEach(k => {
        selectorList.push(`${selector}:contains("${k}")`)
      })
      const keyQuery = this._queryAny(query, selectorList)
      const valueQuery = keyQuery.next()
      result[parser.name] = parser.parseFunction(valueQuery)
    })
    return result
  }
}

module.exports = BaseSite
