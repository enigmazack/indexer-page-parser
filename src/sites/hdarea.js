const NexusPhpSite = require('../models/nexusphp-site')

const hdarea = new NexusPhpSite({
  name: 'www.hdarea.co'
})

hdarea._parseStatus = (query) => {
  let status = ''
  let progress = 0
  switch (true) {
    case query.find('table[title="downloading"]').length == 1:
      status = 'Leeching'
      break
    case query.find('table[title="seeding"]').length == 1:
      status = 'Seeding'
      break
    case query.find('table[title="Stopped"]').length == 1:
      status = 'Stopped'
      break
    case query.find('table[title="completed"]').length == 1:
      status = 'Snatched'
      break
    default:
  }
  if (status) {
    progress = parseInt(query.find('img.progress').parent().attr('style').match(/width: (\d+)%/)[1])
  }
  return { status, progress}
}

module.exports = hdarea
