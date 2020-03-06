/* eslint-disable no-unused-expressions */
const should = require('chai').should()
const BaseSite = require('../src/models/base-site')
const cheerio = require('cheerio')

const testSite = new BaseSite({})

describe('class BaseSite', function () {
  describe('the _parseNumber method', function () {
    it('should parse number string with comma and/or space', function () {
      testSite._parseNumber('1,234').should.eq(1234)
      testSite._parseNumber('1,234,567').should.eq(1234567)
      testSite._parseNumber('1,234.12').should.eq(1234.12)
      testSite._parseNumber('1 234.12').should.eq(1234.12)
      testSite._parseNumber('1, 234.12').should.eq(1234.12)
    })
  })
  describe('the _parseSize method', function () {
    it('should parse size string into bytes', function () {
      testSite._parseSize('1 GB').should.eq(1073741824)
      testSite._parseSize('1 GiB').should.eq(1073741824)
      testSite._parseSize('1 TB').should.eq(1099511627776)
      testSite._parseSize('1 PB').should.eq(1125899906842624)
    })
  })
  describe('the _parsePairwiseTable method', function () {
    it('should parse pairwise table well', function () {
      const $ = cheerio.load(
        '<table><tbody><tr><td>姓名</td><td>Zack</td></tr><tr><td>Age</td><td>18</td></tr></tbody></table>'
      )
      const selector = 'td'
      const parserList = [
        {
          name: 'name',
          key: '姓名',
          parseFunction: (q) => { return q.text() }
        },
        {
          name: 'age',
          key: ['年龄', 'Age'],
          parseFunction: (q) => { return parseInt(q.text()) }
        }
      ]
      const result = testSite._parsePairwiseTable($('table'), selector, parserList)
      result.should.have.property('name').that.eq('Zack')
      result.should.have.property('age').that.eq(18)
    })
  })
})
