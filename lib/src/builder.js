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
const readFileAsync = promisify(fs.readFile)

const tree = {}

Object.keys(sites).forEach((key) => {
  tree[key] = sites[key]
    .filter(file => file.indexOf('_') === -1)
})

const cleanStart = async () => {
  logger.info('Re-Create dist folder')
  await rimrafAsync(path.join(distPath, '*'))
}

const bundleAssets = async () => {
  const promiseArray = []
  Object.keys(tree).forEach(async (site) => {
    logger.info('Bundling Assets for', site)
    const assetsPath = path.join(distPath, site)
    await mkdirpAsync(assetsPath)
    const p = copyDir(
      path.join(sitesDir, site, 'assets'),
      assetsPath
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
      await rimrafAsync(path.join(stylesDistPath, '*'))
      await mkdirpAsync(stylesDistPath)
      const stylesPath = path.join(sitesDir, site, 'assets/styles')
      const files = await readDirAsync(stylesPath)
      return {
        site,
        files
      }
    })
  const itms = await Promise.all(pArray)
  let toProcess = itms
    .reduce((acum, {site, files}) => {
      const sassFiles = files.map(f => {
        return path.join(sitesDir, site, 'assets/styles', f)
      })
      return acum.concat(sassFiles)
    }, [])
    .filter(file => {
      if (path.basename(file)[0] === '_') return false
      return true
    })
  let toCopy = toProcess
    .filter(file => path.extname(file) === '.css')
    .map(async file => {
      const css = await readFileAsync(file)
      return {
        file,
        css
      }
    })
  toCopy = await Promise.all(toCopy)
  toProcess = toProcess
    .filter(file => path.extname(file) === '.sass')
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
  const cssData = []
    .concat(rendered, toCopy)
    .forEach(({file, css}) => {
      const dirname = path.dirname(file)
      let fileName = path.basename(file, '.sass')
      fileName = path.basename(fileName, '.css')
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
  await bundleAssets()
  await bundleHTML()
  await bundleStyles()
})()
