import { promisify } from 'util'
import path from 'path'
import rimraf from 'rimraf'
import { sync as copyDir } from 'copy-dir'
import mkdirp from 'mkdirp'
const pug = require('pug')
const fs = require('fs')
import '../config/logger'
import sites, { sitesDir } from './sites'
import sass from 'sass'

const rimrafAsync = promisify(rimraf)
const distPath = path.join(__dirname, '../dist')
const mkdirpAsync = promisify(mkdirp)
const readDirAsync = promisify(fs.readdir)
const sassRenderAsync = promisify(sass.render)

const tree = {}

Object.keys(sites).forEach((key) => {
  tree[key] = sites[key]
    .filter(file => file.indexOf('_') === -1)
})

const cleanStart = async () => {
  logger.info('Re-Create dist folder')
  await rimrafAsync(distPath)
  await mkdirpAsync(distPath)
}

const bundleImages = async () => {
  const promiseArray = []
  Object.keys(tree).forEach(async (site) => {
    logger.info('Bundling Images for', site)
    const imagesPath = path.join(distPath, site, 'images')
    await mkdirpAsync(imagesPath)
    const p = copyDir(
      path.join(sitesDir, site, 'assets/images'),
      imagesPath
    )
    promiseArray.push(p)
  })
  return await Promise.all(promiseArray)
}

const bundleHTML = async () => {
  Object.keys(tree).forEach(async (site) => {
    logger.info('Bundling HTML files for', site)
    await mkdirpAsync(
      path.join(distPath, site)
    )
    tree[site].forEach(landing => {
      const html = pug.renderFile(
        path.join(sitesDir, site, `${landing}.pug`),
        { pretty: true }
      )
      fs.writeFileSync(
        path.join(distPath, site, `${landing}.html`),
        html
      )
    })
  })
}

const bundleStyles = async () => {
  const pArray = Object.keys(tree)
    .map(async site => {
      logger.info('Bundling CSS files for', site)
      const stylesDistPath = path.join(distPath, site, 'styles')
      await mkdirpAsync(stylesDistPath)
      const stylesPath = path.join(sitesDir, site, 'assets/styles')
      const files = await readDirAsync(stylesPath)
      return {
        site,
        files
      }
    })
  const itms = await Promise.all(pArray)
  const toProcess = itms
    .reduce((acum, {site, files}) => {
      const sassFiles = files.map(f => {
        return path.join(sitesDir, site, 'assets/styles', f)
      })
      return acum.concat(sassFiles)
    }, [])
    .map(async file => {
      const css = await sassRenderAsync({
        file,
        outputStyle: 'compressed'
      })
      return {
        file,
        css: css.css.toString('utf8')
      }
    })
  const rendered = await Promise.all(toProcess)
  const cssData = rendered
    .forEach(({file, css}) => {
      const dirname = path.dirname(file)
      const fileName = path.basename(file, '.sass')
      const site = dirname
        .replace(sitesDir, '')
        .replace('/assets/styles', '')
        .replace('/', '')
      fs.writeFileSync(
        path.join(distPath, site, 'styles', `${fileName}.css`),
        css
      )
    })
}

(async () => {
  await cleanStart()
  await bundleImages()
  await bundleHTML()
  await bundleStyles()
})()
