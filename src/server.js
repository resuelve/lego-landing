import express from 'express'
import path from 'path'
import liveReload from 'livereload'
import HumanElapsed from 'human-elapsed'
import sites, { sitesDir } from './sites'
import sassMiddleware from './sassMiddleware'

export const Server = () => {
  const app = express()

  /**
  * Agregamos al web-server el middleware de sass y live reload
  **/
  app.use(sassMiddleware)
  const lR = liveReload.createServer({
    exts: ['pug', 'js', 'sass']
  })
  lR.watch(sitesDir)
  app.use((req, res, next) => {
    res.locals.LRScript = `
      <script>
        document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
        ':35729/livereload.js?snipver=1"></' + 'script>')
      </script> 
    `
    next()
  })

  /**
  * Creamos las rutas dinámicas de los sitios y landings a maquetar
  **/
  Object.keys(sites).forEach(site => {
    const landings = sites[site]
    const router = express.Router()
    router.use(
      `${site}`,
      express.static(
        path.join(sitesDir, site, 'assets')
      )
    )
    landings
      .filter(landing => landing[0] !== '_')
      .forEach(landing => {
        const route = `${site}/${landing}`
        logger.info(`Landing mounted: ${route}`)
        router.get(route, (req, res) => {
          const view = path.join(sitesDir, route)
          res.render(`${path.join(sitesDir, route)}.pug`, { pretty:true })
        })
      })
    app.use(router)
  })

  /**
  * iniciamos el web-server
  **/
  app.listen(config.PORT, () => {
    logger.info(`Server listening on port ${config.PORT}`)
  })
}
