"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Server = void 0;

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _livereload = _interopRequireDefault(require("livereload"));

var _humanElapsed = _interopRequireDefault(require("human-elapsed"));

var _sites = _interopRequireWildcard(require("./sites"));

var _sassMiddleware = _interopRequireDefault(require("./sassMiddleware"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Server = () => {
  const app = (0, _express.default)();
  /**
  * Agregamos al web-server el middleware de sass y live reload
  **/

  app.use(_sassMiddleware.default);

  const lR = _livereload.default.createServer({
    exts: ['pug', 'js', 'sass']
  });

  lR.watch(_sites.sitesDir);
  app.use((req, res, next) => {
    res.locals.LRScript = `
      <script>
        document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
        ':35729/livereload.js?snipver=1"></' + 'script>')
      </script> 
    `;
    next();
  });
  /**
  * Creamos las rutas dinámicas de los sitios y landings a maquetar
  **/

  Object.keys(_sites.default).forEach(site => {
    const landings = _sites.default[site];

    const router = _express.default.Router();

    router.use(`${site}`, _express.default.static(_path.default.join(_sites.sitesDir, site, 'assets')));
    landings.filter(landing => landing[0] !== '_').forEach(landing => {
      const route = `${site}/${landing}`;
      logger.info(`Landing mounted: ${route}`);
      router.get(route, (req, res) => {
        const view = _path.default.join(_sites.sitesDir, route);

        res.render(`${_path.default.join(_sites.sitesDir, route)}.pug`, {
          pretty: true
        });
      });
    });
    app.use(router);
  });
  /**
  * iniciamos el web-server
  **/

  app.listen(config.PORT, () => {
    logger.info(`Server listening on port ${config.PORT}`);
  });
};

exports.Server = Server;