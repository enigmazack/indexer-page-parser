const hdchinaRequest = require('./hdchina')
const ptSJTURequest = require('./pt-sjtu-edu')

const requestIndividual = (site, name, proxy) => {
  switch (name) {
    case 'hdchina.org':
      hdchinaRequest(site, name, proxy)
      break
    case 'pt.sjtu.edu.cn':
      ptSJTURequest(site, name, proxy)
      break
    default:
  }
}

module.exports = requestIndividual
