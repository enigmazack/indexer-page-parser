const NexusPhpSite = require('../models/nexusphp-site')

const hdarea = new NexusPhpSite({
  name: 'www.hdarea.co'
})

hdarea._parseStatus = (query, index) => {
  const statusQuery = query.eq(index.title)
  let status = ''
  let progress = 0
  switch (true) {
    case statusQuery.find('table[title="downloading"]').length === 1:
      status = 'Leeching'
      break
    case statusQuery.find('table[title="seeding"]').length === 1:
      status = 'Seeding'
      break
    case statusQuery.find('table[title="Stopped"]').length === 1:
      status = 'Stopped'
      break
    case statusQuery.find('table[title="completed"]').length === 1:
      status = 'Snatched'
      break
    default:
  }
  if (status) {
    progress = parseInt(statusQuery.find('img.progress').parent().attr('style').match(/width: (\d+)%/)[1])
  }
  return { status, progress }
}

module.exports = hdarea
