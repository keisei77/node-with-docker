let express = require('express')
let serveStatic = require('serve-static')
let path = require('path')
let utils = require('./utils')

module.exports = dir => {
  dir = dir || '.'

  // Init express
  let app = express()
  let router = express.Router()
  app.use('/assets', serveStatic(path.resolve(dir, 'assets')))
  app.use(router)

  // Render articles
  router.get('/posts/*', (req, res, next) => {
    let name = utils.stripExtname(req.params[0])
    let file = path.resolve(dir, '_posts', `${name}.md`)
    let html = utils.renderPost(dir, file)
    res.end(html)
  })

  // Render lists
  router.get('/', (req, res, next) => {
    let html = utils.renderIndex(dir)
    res.end(html)
  })

  let config = utils.loadConfig(dir)
  let port = config.port || 3000
  let url = `http://127.0.0.1:${port}`
  app.listen(port)
}
