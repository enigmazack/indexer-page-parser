const hdchinaRequest = require('./sites/hdchina')

const requestIndividual = (site, name, proxy) => {
  switch (name) {
    case 'hdchina.org':
      hdchinaRequest(site, name, proxy)
      break
    default:
  }
}

module.exports = requestIndividual