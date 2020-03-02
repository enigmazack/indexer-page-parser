const getNexusphpQueries = require('./nexusphp-query')

const getQueries = (name) => {
  switch (name) {
    case 'www.hddolby.com':
    case 'www.hdarea.co':
    case 'ourbits.club':
      return getNexusphpQueries(name)
    default:
      return {}
  }
}

module.exports = getQueries
