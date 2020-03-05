const NexusPhpSite = require('../models/nexusphp-site')

const ptSJTU = new NexusPhpSite({
  name: 'pt.sjtu.edu.cn'
})

ptSJTU._indexPageParser = function (query) {
  // parse user id
  const userQuery = query('a[href*="userdetails.php?id="]').first()
  const userId = parseInt(userQuery.attr('href').match(/id=(\d+)/)[1])
  // skip parse unread message
  return {
    userId,
    unreadMessage: 0
  }
}

module.exports = ptSJTU
