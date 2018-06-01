import sass from 'sass'
import url from 'url'
import fs from 'fs'
import path from 'path'

const srcPath = path.join(__dirname, '../sites/')

export const sassParser = (file, cb) => {
  sass.render({
    file: path.join(srcPath, `${file}.sass`),
  }, cb)
}

export default (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  const route = url.parse(req.url)
    .pathname
    .replace('/styles/','/assets/styles/')
  if (!/\.css$/.test(route)) return next()
  const basename = path.basename(route,'.css')
  const dirname = path.dirname(route)
  sassParser(path.join(dirname, basename), (err, css) => {
    if (!err) {
      res.header('Content-type', 'text/css')
      res.send(css.css)
      return
    }
    try {
      const css = fs.readFileSync(
        path.join(srcPath, route), {
        encoding: 'utf8'
      })
      res.header('Content-type', 'text/css')
      res.send(css)
    } catch (cssError) {
      logger.error(cssError)
      next()
    }
  })
}
