const nameList = [
  'www.hddolby.com',
  'www.hdarea.co',
  'ourbits.club',
  'springsunday.net',
  'hdchina.org',
  'pt.m-team.cc',
  'pt.sjtu.edu.cn',
  'leaguehd.com',
  'moecat.best'
]
const should = require('chai').should()
const pageParser = require('../src/index')
const sitesQuery = require('../scripts/utils/get-queries')

nameList.forEach(name => {
  const query = sitesQuery(name)
  describe(name, function () {
    it('should parse index.php', function () {
      const result = pageParser(query.index, `https://${name}/index.php`)
      result.should.have.property('userId').that.is.a('number')
      result.should.have.property('unreadMessage').that.is.a('number')
    })
    it('should parse userdetails.php with seeding torrents', function () {
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
    it('should parse torrents.php', function () {
      const result = pageParser(query.torrent, `https://${name}/torrents.php`)
      result.should.be.an('array')
      if (result.length > 0) {
        result[0].should.have.property('category').that.is.a('number')
        result[0].should.have.property('id').that.is.a('number')
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
        result[0].should.have.property('isActive').that.is.oneOf([true, false])
        result[0].should.have.property('progress').that.is.a('number')
      }
    })
    if (name === 'pt.m-team.cc') {
      it('should parse getusertorrentlist.php', function () {
        const result = pageParser(query.seeding, `https://${name}/getusertorrentlist.php`)
        result.should.have.property('pagesCount').that.is.a('number')
        result.should.have.property('seedingTorrents').that.is.an('array')
        if (result.seedingTorrents.length > 0) {
          result.seedingTorrents[0].should.have.property('id').that.is.a('number')
          result.seedingTorrents[0].should.have.property('size').that.is.a('number')
        }
      })
    }
  })
})
