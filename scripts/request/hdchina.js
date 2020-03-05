const requester = require('./requester')
const singlePageHandle = require('./single-page-handle')
// const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')
const qs = require('querystring')

const request = (site, name, proxy) => {
  const request = requester(site, proxy)
  const dirPath = path.join(__dirname, `../../pages/${name}`)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  // request index
  singlePageHandle(name, site.pages.index, 'index', request, dirPath)

  // request torrent page with promotion data
  const torrentFilePath = path.join(dirPath, 'torrent.html')
  if (fs.existsSync(torrentFilePath)) {
    console.log(`${name}/user: skip`)
  } else {
    request(site.pages.torrent)
      .then(res => {
        if (res.status === 200) {
          const torrentDom = new JSDOM(res.data, {
            contentType: 'text/html; charset=utf-8'
          })
          const window = torrentDom.window
          const document = window.document
          const csrf = document
            .querySelector('meta[name="x-csrf"]')
            .getAttribute('content')
          const $ = require('jquery')(window)
          const torrents = $('span.sp_state_placeholder')
            .map(function () {
              return this.id
            })
            .toArray()
          const requestBody = {
            'ids[]': torrents,
            csrf
          }
          request
            .post('ajax_promotion.php', qs.stringify(requestBody))
            .then(promotionRes => {
              if (promotionRes.status === 200) {
                for (const [key, value] of Object.entries(promotionRes.data.message)) {
                  $(`span#${key}.sp_state_placeholder`)
                    .replaceWith('<p>' + value.sp_state + '</p>' + value.timeout)
                }
                fs.writeFileSync(torrentFilePath, torrentDom.serialize())
                console.log(`${name}/torrent: added (with promotion data)`)
              } else {
                console.log(`${name}/promotion: response code ${promotionRes.status}`)
              }
            })
            .catch(promotionErr => {
              console.log(`${name}/promotion: ${promotionErr}`)
            })
        } else {
          console.log(`${name}/torrent: response code ${res.status}`)
        }
      })
      .catch(err => {
        console.log(`${name}/torrent: ${err}`)
      })
  }

  // request user page with seeding data
  const userFilePath = path.join(dirPath, 'user.html')
  const userId = site.pages.user.match(/id=(\d+)/)[1]
  if (fs.existsSync(userFilePath)) {
    console.log(`${name}/user: skip`)
  } else {
    request(site.pages.user)
      .then(res => {
        if (res.status === 200) {
          const userDom = new JSDOM(res.data, {
            contentType: 'text/html; charset=utf-8'
          })
          const document = userDom.window.document
          const csrf = document
            .querySelector('meta[name="x-csrf"]')
            .getAttribute('content')
          const requestBody = {
            userid: userId,
            type: 'seeding',
            csrf
          }
          request
            .post('ajax_getusertorrentlist.php', qs.stringify(requestBody))
            .then(seedingRes => {
              if (seedingRes.status === 200) {
                document.getElementById('ka1').innerHTML = seedingRes.data.message
                fs.writeFileSync(userFilePath, userDom.serialize())
                console.log(`${name}/user: added (with seeding data)`)
              } else {
                console.log(`${name}/seeding: response code ${seedingRes.status}`)
              }
            })
            .catch(seedingErr => {
              console.log(`${name}/seeding: ${seedingErr}`)
            })
        } else {
          console.log(`${name}/user: response code ${res.status}`)
        }
      })
      .catch(err => {
        console.log(`${name}/user: ${err}`)
      })
  }
}

module.exports = request

// code from the website
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

// const torrents = jQuery('span.sp_state_placeholder').map(function () {
//   return this.id
// }).toArray()

// jQuery.post('ajax_promotion.php', {
//   ids: torrents,
//   csrf: get_csrf()
// },
// function (response) {
//   if (response.status === 200) {
//     for (const [key, value] of Object.entries(response.message)) {
//       jQuery('span#' + key + '.sp_state_placeholder').replaceWith('<p>' + value.sp_state + '</p>' + value.timeout)
//     }
//   }
// })
