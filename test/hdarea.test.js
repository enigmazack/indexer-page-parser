const name = 'www.hdarea.co'
const should = require('chai').should()
const query = require('./utils/common-nexusphp')(name)
const pageParser = require('../src/index')

describe(name, () => {
  it('should parse index.php', () => {
    const result = pageParser(query.index, `https://${name}/index.php`)
    result.should.have.property('userId').that.is.a('number')
  })
})