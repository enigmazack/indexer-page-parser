const hddolbyParser = require('./www.hddolby.com')
const hdareaParser = require('./www.hdarea.co')

const pageParser = (query, url) => {
  const site = new URL(url).hostname
  switch (site) {
    case 'www.hddolby.com':
      return hddolbyParser(query, url)
    case 'www.hdarea.co':
      return hdareaParser(query, url)
    default:
      return {}
  }
}

module.exports = pageParser
