let path = require('path')
let utils = require('./utils')
let fse = require('fs-extra')
let moment = require('moment')

module.exports = dir => {
  dir = dir || '.'

  // Create fundamental directory
  fse.mkdirsSync(path.resolve(dir, '_layout'))
  fse.mkdirsSync(path.resolve(dir, '_posts'))
  fse.mkdirsSync(path.resolve(dir, 'assets'))
  fse.mkdirsSync(path.resolve(dir, 'posts'))

  // Copy template
  let tplDir = path.resolve(__dirname, '../tpl')
  fse.copySync(tplDir, dir)

  // Create first article
  newPost(dir, 'hello, world', 'This is my first essay')
  console.log('OK')
}

// Create an essay
function newPost (dir, title, content) {
  let data = [
    '---',
    `title: ${title}`,
    `date: ${moment().format('YYYY-MM-DD')}`,
    '---',
    '',
    content
  ].join('\n')
  let name = moment().format('YYYY-MM-DD') + '/hello-world.md'
  let file = path.resolve(dir, '_posts', name)
  fse.outputFileSync(file, data)
}
