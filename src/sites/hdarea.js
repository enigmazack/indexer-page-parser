const NexusPhpSite = require('../models/nexusphp-site')

const hdarea = new NexusPhpSite({
  name: 'www.hdarea.co'
})

hdarea._parseStatus = (query, index) => {
  const statusQuery = query.eq(index.title)
  let isActive = false
  let progress = 0
  switch (true) {
    case statusQuery.find('table[title="downloading"]').length === 1:
    case statusQuery.find('table[title="seeding"]').length === 1:
      isActive = true
      break
    // case statusQuery.find('table[title="Stopped"]').length === 1:
    // case statusQuery.find('table[title="completed"]').length === 1:
    //   isActive = false
    //   break
    default:
  }
  const progressQuery = statusQuery.find('img.progress')
  if (progressQuery.length) {
    progress = parseInt(progressQuery.parent().attr('style').match(/width.+?(\d[\d.]*)%/)[1])
  }
  return { isActive, progress }
}

module.exports = hdarea
