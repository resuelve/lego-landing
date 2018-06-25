import fs from 'fs'
import path from 'path'

/**
* Define el path a donde estarán las vistas ordenadas por nombre de sitio
**/
export const sitesDir = path.join(__dirname, '../sites')

/**
* Función recursiva que pasa por todo un directorio trayaendo
* una referencia a la ruta de la vista y la vista
**/
const traceRoutes = (dir) => {
  const stat = fs.statSync(dir)
  if (!stat.isDirectory()) {
    const file = dir
      .replace(sitesDir,'')
    return {
      path: path.dirname(file),
      view: path.basename(file,'.pug')
    }
  }
  return fs.readdirSync(dir)
    .filter(file => file !== 'assets')
    .map(file => {
      return traceRoutes(path.join(dir, file))
    })
}

/**
* procesamos el resultado de la funcion recursiva
* para traer un objeto de rutas y vistas ordenado
**/
const sites = traceRoutes(sitesDir)
  .filter(({view}) => view !== '.DS_Store')
  .filter(({view}) => view !== '.gitignore')
  .reduce((acum, current) => {
    if (Array.isArray(current)) {
      return acum.concat(current)
    }
    return current
  },[])
  .reduce((acum, current) => {
    if (acum[current.path]) {
      acum[current.path].push(current.view)
    } else {
      acum[current.path] = [current.view]
    }
    return acum
  }, {})

export default sites
