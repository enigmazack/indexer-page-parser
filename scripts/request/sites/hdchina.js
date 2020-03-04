const requester = require('../requester')
const singlePageHandle = require('../single-page-handle')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')
const qs = require('querystring')

const request = (site, name, proxy) => {
  const request = requester(site, proxy)
  const dirPath = path.join(__dirname, `../../../pages/${name}`)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  _.forEach({
    index: site.pages.index,
    torrent: site.pages.torrent
  }, (page, key) => {
    singlePageHandle(name, page, key, request, dirPath)
  })
  // request user page with seeding data
  const filePath = path.join(dirPath, 'user.html')
  const userId = site.pages.user.match(/id=(\d+)/)[1]
  if (fs.existsSync(filePath)) {
    console.log(`${name}/user: skip`)
  } else {
    request(site.pages.user).then(res => {
      if (res.status === 200) {
        const userDom = new JSDOM(res.data, { contentType: 'text/html; charset=utf-8' })
        const csrf = userDom.window.document.querySelector('meta[name="x-csrf"]').getAttribute('content')
        const requestBody = {
          userid: userId,
          type: 'seeding',
          csrf
        }
        request.post('ajax_getusertorrentlist.php',
          // `userid=${userId}&type=seeding&csrf=${csrf}`
          qs.stringify(requestBody)
        ).then(seedingRes => {
          if (seedingRes.status === 200) {
            userDom.window.document.getElementById('ka1').innerHTML = seedingRes.data.message
            fs.writeFileSync(filePath, userDom.serialize())
            console.log(`${name}/user: added (with seeding data)`)
          } else {
            console.log(`${name}/seeding: response code ${seedingRes.status}`)
          }
        }).catch(seedingErr => {
          console.log(`${name}/seeding: ${seedingErr}`)
        })
      } else {
        console.log(`${name}/user: response code ${res.status}`)
      }
    }).catch(err => {
      console.log(`${name}/user: ${err}`)
    })
  }
}

module.exports = request

// function getusertorrentlistajax(userid, type, blockid) {
//   if (document.getElementById(blockid).innerHTML === "") {
//     jQuery.post('ajax_getusertorrentlist.php', {
//       userid: userid,
//       type: type,
//       csrf: get_csrf()
//     }, function (data) {
//       document.getElementById(blockid).innerHTML = data['message'];
//     });
//   }
//   return true;
// }

// function get_csrf(key = 'x-csrf') {
//   const element = document.querySelector('meta[name='+key+']');
//   if (null !== element) {
//     return element.getAttribute("content");
//   }
//   return '';
// }
