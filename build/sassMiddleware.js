"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.sassParser = void 0;

var _sass = _interopRequireDefault(require("sass"));

var _url = _interopRequireDefault(require("url"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _sites = require("./sites");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const srcPath = _path.default.join(_sites.sitesDir);
/**
* Función para transformar un sass en css
**/


const sassParser = (file, cb) => {
  _sass.default.render({
    file: _path.default.join(srcPath, `${file}.sass`)
  }, cb);
};
/**
* El middleware que detecta la petición de css
* Si viene como css, intenta buscar un sass con el mismo nombre para
* renderearlo, Si no lo encuentra o marca error, intenta regresar
* un css con el mismo nombre (vendors)
* Si todo falla, continua al next, (el 404 se maneja desde otro lado)
**/


exports.sassParser = sassParser;

var _default = (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const route = _url.default.parse(req.url).pathname.replace('/styles/', '/assets/styles/');

  if (!/\.css$/.test(route)) return next();

  const basename = _path.default.basename(route, '.css');

  const dirname = _path.default.dirname(route);

  sassParser(_path.default.join(dirname, basename), (err, css) => {
    if (!err) {
      res.header('Content-type', 'text/css');
      res.send(css.css);
      return;
    }

    try {
      const css = _fs.default.readFileSync(_path.default.join(srcPath, route), {
        encoding: 'utf8'
      });

      res.header('Content-type', 'text/css');
      res.send(css);
    } catch (cssError) {
      logger.error(cssError);
      next();
    }
  });
};

exports.default = _default;