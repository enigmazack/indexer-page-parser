const hddolby = require('./sites/www.hddolby.com')
const hdarea = require('./sites/www.hdarea.co')

const pageParser = (query, url) => {
  const site = new URL(url).hostname
  switch (site) {
    case 'www.hddolby.com':
      return hddolby.pageParser(query, url)
    case 'www.hdarea.co':
      return hdarea.pageParser(query, url)
    default:
      return {}
  }
}

module.exports = pageParser
