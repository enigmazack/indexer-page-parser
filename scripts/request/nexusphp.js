const requester = require('./requester')
const singlePageHandle = require('./single-page-handle')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const requestNexusphp = (site, name, proxy) => {
  const request = requester(site, proxy)
  const pages = {
    index: '/index.php',
    torrent: '/torrents.php',
    user: `/userdetails.php?id=${site.id}`,
    seeding: `/getusertorrentlistajax.php?userid=${site.id}&type=seeding`
  }
  // to creat the dir which keeps request html files
  const dirPath = path.join(__dirname, `../../pages/${name}`)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  // handle index and torrent pages
  _.forEach({
    index: pages.index,
    torrent: pages.torrent
  }, (page, key) => {
    singlePageHandle(name, page, key, request, dirPath)
  })
  // handle user page
  const filePath = path.join(dirPath, 'user.html')
  if (fs.existsSync(filePath)) {
    console.log(`${name}/user: skip`)
  } else {
    const userRequest = request(pages.user)
    const seedingRequest = request(pages.seeding)
    Promise.all([
      userRequest,
      seedingRequest
    ]).then(res => {
      const userRes = res[0]
      const seedingRes = res[1]
      if (userRes.status === 200 && seedingRes.status === 200) {
        const userDom = new JSDOM(userRes.data, { contentType: 'text/html; charset=utf-8' })
        userDom.window.document.getElementById('ka1').innerHTML = seedingRes.data
        fs.writeFileSync(filePath, userDom.serialize())
        console.log(`${name}/user: added (with seeding data)`)
      } else {
        console.log(`${name}/user: response code ${userRes.status} (user) ${seedingRes.status} (seeding)`)
      }
    }).catch(err => {
      console.log(`${name}/user: ${err}`)
    })
  }
}

module.exports = requestNexusphp
