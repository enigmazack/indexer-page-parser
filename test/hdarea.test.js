const name = 'www.hddolby.com'
const should = require('chai').should()
const query = require('./utils/common-nexusphp')(name)
const pageParser = require('../src/index')

describe(name, () => {
  it('should parse index.php', () => {
    const result = pageParser(query.index, `https://${name}/index.php`)
    result.should.have.property('userId').that.is.a('number')
  })
  it('should parse userdetails.php with seeding torrents', () => {
    const result = pageParser(query.user, `https://${name}/userdetails.php`)
    result.should.have.property('userName').that.is.a('string')
    result.should.have.property('userClass').that.is.a('string')
    result.should.have.property('uploadTraffic').that.is.a('number')
    result.should.have.property('downloadTraffic').that.is.a('number')
    result.should.have.property('bonus').that.is.a('number')
    result.should.have.property('joinDate').that.is.a('number')
    result.should.have.property('seedingTorrents').that.is.an('array')
    if (result.seedingTorrents.length > 0) {
      result.seedingTorrents[0].should.have.property('id').that.is.a('number')
      result.seedingTorrents[0].should.have.property('size').that.is.a('number')
    }
  })
  it('should parse torrents.php', () => {
    const result = pageParser(query.torrent, `https://${name}/torrents.php`)
    result.should.be.an('array')
    if (result.length > 0) {
      result[0].should.have.property('category').that.is.a('number')
      result[0].should.have.property('title').that.is.a('string')
      result[0].should.have.property('subTitle').that.is.a('string')
      result[0].should.have.property('isFreeleech').that.is.oneOf([true, false])
      result[0].should.have.property('promotionDeadline').that.is.a('number')
      result[0].should.have.property('tags').that.is.an('array')
      result[0].should.have.property('date').that.is.a('number')
      result[0].should.have.property('size').that.is.a('number')
      result[0].should.have.property('seeds').that.is.a('number')
      result[0].should.have.property('leeches').that.is.a('number')
      result[0].should.have.property('snatched').that.is.a('number')
      result[0].should.have.property('status').that.is.oneOf(['Seeding', 'Leeching', 'Snatched', 'Stopped', ''])
      result[0].should.have.property('progress').that.is.a('number')
    }
  })
})