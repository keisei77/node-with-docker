let path = require('path')
let fs = require('fs')
let MarkdownIt = require('markdown-it')
let swig = require('swig')
swig.setDefaults({ cache: false })
let rd = require('rd')

let md = new MarkdownIt({
  html: true,
  langPrefix: 'code-'
})

// Remove the extension name
function stripExtname (name) {
  let i = 0 - path.extname(name).length
  if (i === 0) i = name.length
  return name.slice(0, i)
}

// Convert markdown to html
function markdownToHTML (content) {
  return md.render(content || '')
}

// Parse article content
function parseSourceContent (data) {
  let split = '---\n'
  let i = data.indexOf(split)
  let info = {}
  if (~i) {
    let j = data.indexOf(split, i + split.length)
    if (~j) {
      let str = data.slice(i + split.length, j).trim()
      data = data.slice(j + split.length)
      str.split('\n').forEach(line => {
        let i = line.indexOf(':')
        if (~i) {
          let name = line.slice(0, i).trim()
          let value = line.slice(i + 1).trim()
          info[name] = value
        }
      })
    }
  }
  info.source = data
  return info
}

// Render template
function renderFile (file, data) {
  return swig.render(fs.readFileSync(file).toString(), {
    filename: file,
    autoescape: false,
    locals: data
  })
}

// Traverse every article
function eachSourceFile (sourceDir, callback) {
  rd.eachFileFilterSync(sourceDir, /\.md$/, callback)
}

// Render article
function renderPost (dir, file) {
  let content = fs.readFileSync(file).toString()
  let post = parseSourceContent(content.toString())
  post.content = markdownToHTML(post.source)
  post.layout = post.layout || 'post'
  let config = loadConfig(dir)
  let layout = path.resolve(dir, '_layout', `${post.layout}.html`)
  let html = renderFile(layout, {
    config: config,
    post: post
  })
  return html
}

// Render article list
function renderIndex (dir) {
  let list = []
  let sourceDir = path.resolve(dir, '_posts')
  eachSourceFile(sourceDir, (f, s) => {
    let source = fs.readFileSync(f).toString()
    let post = parseSourceContent(source)
    post.timestamp = new Date(post.date)
    post.url = `/posts/${stripExtname(f.slice(sourceDir.length + 1))}.html`
    list.push(post)
  })

  list.sort((a, b) => {
    return b.timestamp - a.timestamp
  })

  let config = loadConfig(dir)
  let layout = path.resolve(dir, '_layout', 'index.html')
  let html = renderFile(layout, {
    config: config,
    posts: list
  })
  return html
}

// Load config file
function loadConfig (dir) {
  let content = fs.readFileSync(path.resolve(dir, 'config.json')).toString()
  let data = JSON.parse(content)
  return data
}

// Export functions
exports.renderPost = renderPost
exports.renderIndex = renderIndex
exports.stripExtname = stripExtname
exports.eachSourceFile = eachSourceFile
exports.loadConfig = loadConfig
