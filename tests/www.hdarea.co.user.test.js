

const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const name = 'www.hdarea.co'

const html = fs.readFileSync(path.join(__dirname, `../pages/${name}.user.html`))
const htmlSeeding = fs.readFileSync(path.join(__dirname, `../pages/${name}.seeding.html`))
const dom = new JSDOM(html)
const window = dom.window
const document = window.document
// assemble seeding torrent info into user details page
// this is native to nexusphp
// // in userdetails.php
// function getusertorrentlistajax(userid, type, blockid) {
//   if (document.getElementById(blockid).innerHTML == "") {
//       $.get('getusertorrentlistajax.php?userid=' + userid + '&type=' + type,function(d) {
//           document.getElementById(blockid).innerHTML = d;
//       },'html');
//   }
//   return true;
// }
if (document.getElementById('ka1').innerHTML == "") {
  document.getElementById('ka1').innerHTML = htmlSeeding
}

const $ = require('jquery')(window)

// module.exports = $

const NexusPhpSite = require('../src/models/nexusphp-site')

const site = new NexusPhpSite({ name })

const results = site.pageParser($, `https://${name}/userdetails.php`)

console.log(results)
