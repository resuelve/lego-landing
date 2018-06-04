import express from 'express'
import path from 'path'
import liveReload from 'easy-livereload'
import HumanElapsed from 'human-elapsed'
import sites, { sitesDir } from './sites'
import sassMiddleware from './sassMiddleware'
const app = express()

var fileTypeMap = {
  pug: 'html',
  sass: 'css'
}
const fileTypeRegex =
  new RegExp('\\.(' + Object.keys(fileTypeMap).join('|') + ')$')

app.get('/', (req,res) => {
  res.json({
    now: new Date(),
    uptime: HumanElapsed(process.uptime())
  })
})
app.use(sassMiddleware)
app.use(liveReload({
  watchDirs: [
    path.join(__dirname, '../sites'),
  ],
  checkFunc: file => {
    return fileTypeRegex.test(file)
  },
  renameFunc: file => {
    return file.replace(fileTypeRegex, function(extention) {
      return `.${fileTypeMap[extention.slice(1)]}`
    })
  },
  app: app
}));

Object.keys(sites).forEach(site => {
  const landings = sites[site]
  const router = express.Router()
  router.use(
    `${site}`,
    express.static(
      path.join(__dirname, '../sites', site, 'assets')
    )
  )
  landings.forEach(landing => {
    const route = `${site}/${landing}`
    router.get(route, (req, res) => {
      const view = path.join(sitesDir, route)
      res.render(`${path.join(sitesDir, route)}.pug`, { pretty:true })
    })
  })
  app.use(router)
})

app.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT}`)
})
