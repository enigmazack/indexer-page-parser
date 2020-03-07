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
        // so size >= 8 PB will be parsed into an approximate value
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
   * Parse time (with units in Chinese) into ms
   * @param {string} timeString - time string with units in Chinese
   * @returns {number} time of ms
   */
  _parseTime (timeString) {
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
    return length * 60 * 1000
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
   * @property {string|string[]} keywords - content of selector
   * @property {function} parseFunction - parse function to get the value
   */

  /**
   * Parse table with only two columns like
   * key1 | value1
   * key2 | value2
   * ...
   * @param {JQuery} query - table query object
   * @param {string} selector - selector of the key column
   * @param {pairwiseParser[]} parserList - list of pairwiseParser
   * @returns {object} contians result of each parser
   */
  _parsePairwiseTable (query, selector, parserList) {
    const result = {}
    // parserList.forEach(parser => {
    for (const parser of parserList) {
      const keywords = Array.isArray(parser.keywords) ? parser.keywords : [parser.keywords]
      const selectorList = []
      keywords.forEach(key => {
        selectorList.push(`${selector}:contains("${key}")`)
      })
      const keyQuery = this._queryAny(query, selectorList)
      const valueQuery = keyQuery.next()
      result[parser.name] = parser.parseFunction(valueQuery)
    }
    return result
  }

  /**
   * @typedef chartTdParser
   * @type {object}
   * @property {string} name - name of the parser
   * @property {number} index - index of the columns
   * @property {function} parseFunction - parse function to get the value
   */

  /**
   * @typedef chartTrParser
   * @type {object}
   * @property {string} name - name of the parser
   * @property {function} parseFunction - parse function to get the value
   */

  /**
   * Parse chart like
   * head1   | head2   | head3
   * value11 | value12 | value13
   * value21 | value22 | value23
   * ...
   * @param {JQuery} query - table query object
   * @param {chartTdParser} tdParserList - list of chartTdParser
   * @param {chartTrParser} trParserList - list of chartTrParser
   * @param {string} theadStyle - 'firstTr' or 'thead'
   * @returns {object[]} list contians parsed values of each row
   */
  _parseChartTable (query, tdParserList, trParserList = [], theadStyle = 'firstTr') {
    const trList = query.find('> tbody > tr')
    const i0 = theadStyle === 'firstTr' ? 1 : 0
    const results = []
    for (let i = i0; i < trList.length; i++) {
      const result = {}
      const tdList = trList.eq(i).find('> td')
      tdParserList.forEach(parser => {
        const valueQuery = tdList.eq(parser.index)
        result[parser.name] = parser.parseFunction(valueQuery)
      })
      // sometimes we need to get information from the <tr> block
      trParserList.forEach(parser => {
        const valueQuery = trList.eq(i)
        result[parser.name] = parser.parseFunction(valueQuery)
      })
      results.push(result)
    }
    return results
  }
}

module.exports = BaseSite
