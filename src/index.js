const hddolby = require('./sites/hddolby')
const hdarea = require('./sites/hdarea')
const ourbits = require('./sites/ourbits')
const springsunday = require('./sites/springsunday')
const hdchina = require('./sites/hdchina')
const mteam = require('./sites/m-team')
const ptSJTU = require('./sites/pt-sjtu-edu')
const leaguehd = require('./sites/leaguehd')

const pageParser = (query, url) => {
  const site = new URL(url).hostname
  switch (site) {
    case 'www.hddolby.com':
      return hddolby.pageParser(query, url)
    case 'www.hdarea.co':
      return hdarea.pageParser(query, url)
    case 'ourbits.club':
      return ourbits.pageParser(query, url)
    case 'springsunday.net':
      return springsunday.pageParser(query, url)
    case 'hdchina.org':
      return hdchina.pageParser(query, url)
    case 'pt.m-team.cc':
      return mteam.pageParser(query, url)
    case 'pt.sjtu.edu.cn':
      return ptSJTU.pageParser(query, url)
    case 'leaguehd.com':
      return leaguehd.pageParser(query, url)
    default:
      return 'Unknow site'
  }
}

module.exports = pageParser
