let path = require('path')
let utils = require('./utils')
let fse = require('fs-extra')

module.exports = (dir, options) => {
  dir = dir || '.'
  let outputDir = path.resolve(options.output || dir)

  // Write file
  function outputFile (file, content) {
    console.log('Generate page: %s', file.slice(outputDir.length + 1))
    fse.outputFileSync(file, content)
  }

  // Generate article content
  let sourceDir = path.resolve(dir, '_posts')
  utils.eachSourceFile(sourceDir, (f, s) => {
    let html = utils.renderPost(dir, f)
    let relativeFile = utils.stripExtname(f.slice(sourceDir.length + 1)) + '.html'
    let file = path.resolve(outputDir, 'posts', relativeFile)
    outputFile(file, html)
  })

  // Generate homepage
  let htmlIndex = utils.renderIndex(dir)
  let fileIndex = path.resolve(outputDir, 'index.html')
  outputFile(fileIndex, htmlIndex)
}