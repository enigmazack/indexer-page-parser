const fs = require('fs')
const path = require('path')

const handle = (name, page, key, request, dirPath) => {
  const filePath = path.join(dirPath, `${key}.html`)
  if (fs.existsSync(filePath)) {
    console.log(`${name}/${key}: skip`)
  } else {
    request(page)
      .then(res => {
        if (res.status === 200) {
          fs.writeFileSync(filePath, res.data)
          console.log(`${name}/${key}: added`)
        } else {
          console.log(`${name}/${key}: response code ${res.status}`)
        }
      })
      .catch(err => {
        console.log(`${name}/${key}: ${err}`)
      })
  }
}

module.exports = handle
