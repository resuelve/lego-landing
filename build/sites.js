"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.sitesDir = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* Define el path a donde estarán las vistas ordenadas por nombre de sitio
**/
const sitesDir = _path.default.join(process.cwd(), './sites');
/**
* Función recursiva que pasa por todo un directorio trayaendo
* una referencia a la ruta de la vista y la vista
**/


exports.sitesDir = sitesDir;

const traceRoutes = dir => {
  const stat = _fs.default.statSync(dir);

  if (!stat.isDirectory()) {
    const file = dir.replace(sitesDir, '');
    return {
      path: _path.default.dirname(file),
      view: _path.default.basename(file, '.pug')
    };
  }

  return _fs.default.readdirSync(dir).filter(file => file !== 'assets').map(file => {
    return traceRoutes(_path.default.join(dir, file));
  });
};
/**
* procesamos el resultado de la funcion recursiva
* para traer un objeto de rutas y vistas ordenado
**/


const sites = traceRoutes(sitesDir).filter(({
  view
}) => view !== '.DS_Store').filter(({
  view
}) => view !== '.gitignore').reduce((acum, current) => {
  if (Array.isArray(current)) {
    return acum.concat(current);
  }

  return current;
}, []).reduce((acum, current) => {
  if (acum[current.path]) {
    acum[current.path].push(current.view);
  } else {
    acum[current.path] = [current.view];
  }

  return acum;
}, {});
var _default = sites;
exports.default = _default;