const siteMap = new Map([
  ['www.hddolby.com', require('./sites/hddolby')],
  ['www.hdarea.co', require('./sites/hdarea')],
  ['ourbits.club', require('./sites/ourbits')],
  ['springsunday.net', require('./sites/springsunday')],
  ['hdchina.org', require('./sites/hdchina')],
  ['pt.m-team.cc', require('./sites/m-team')],
  ['pt.sjtu.edu.cn', require('./sites/pt-sjtu-edu')],
  ['leaguehd.com', require('./sites/leaguehd')],
  ['moecat.best', require('./sites/moecat')]
])

const pageParser = (query, url) => {
  const site = new URL(url).hostname
  return siteMap.get(site).pageParser(query, url)
}

module.exports = pageParser
