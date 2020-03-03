const hddolby = require('./sites/hddolby')
const hdarea = require('./sites/hdarea')
const ourbits = require('./sites/ourbits')
const springsunday = require('./sites/springsunday')

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
    default:
      return {}
  }
}

module.exports = pageParser
