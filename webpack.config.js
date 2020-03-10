const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'page-parser.js',
    library: 'pageParser',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
}
