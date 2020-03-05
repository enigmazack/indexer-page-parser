const requester = require('./requester')
const singlePageHandle = require('./single-page-handle')
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')
const _ = require('lodash')

const request = (site, name, proxy) => {
  const request = requester(site, proxy)
  const dirPath = path.join(__dirname, `../../pages/${name}`)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  // request index and torrents page
  _.forEach({
    index: site.pages.index,
    torrent: site.pages.torrent
  }, (page, key) => {
    singlePageHandle(name, page, key, request, dirPath)
  })
  // request user page
  const filePath = path.join(dirPath, 'user.html')
  if (fs.existsSync(filePath)) {
    console.log(`${name}/user: skip`)
  } else {
    const userId = site.pages.user.match(/id=(\d+)/)[1]
    const userRequest = request(site.pages.user)
    const viewRequest = request(`/viewtorrentsdetail.php?&id=${userId}`)
    const seedingRequest = request(`/viewusertorrents.php?&id=${userId}&show=seeding`)
    Promise.all([
      userRequest,
      viewRequest,
      seedingRequest
    ]).then(res => {
      const userRes = res[0]
      const viewRes = res[1]
      const seedingRes = res[2]
      if (userRes.status === 200 && viewRes.status === 200 && seedingRes.status === 200) {
        const userDom = new JSDOM(userRes.data, { contentType: 'text/html; charset=utf-8' })
        const $ = require('jquery')(userDom.window)
        $('#TdTemp').replaceWith(viewRes.data)
        $('#ka1').html(seedingRes.data)
        fs.writeFileSync(filePath, userDom.serialize())
        console.log(`${name}/user: added (with seeding data)`)
      } else {
        console.log(`${name}/user: bad response code`)
      }
    }).catch(err => {
      console.log(`${name}/user: ${err}`)
    })
  }
}

module.exports = request
