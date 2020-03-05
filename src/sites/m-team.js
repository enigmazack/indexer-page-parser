const NexusPhpSite = require('../models/nexusphp-site')

const mteam = new NexusPhpSite({
  name: 'pt.m-team.cc'
})

mteam._seedingPageParser = (query) => {
  return []
}

mteam.pageParser = (query, url) => {
  const path = new URL(url).pathname
  switch (path) {
    case '/index.php':
      return mteam._indexPageParser(query)
    case '/torrents.php':
      return mteam._torrentPageParser(query)
    case '/userdetails.php':
      return mteam._userPageParser(query)
    case '/getusertorrentlist.php':
      return mteam._seedingPageParser(query)
    default:
      return {}
  }
}

module.exports = mteam
