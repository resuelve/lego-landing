"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Builder = void 0;

var _util = require("util");

var _path = _interopRequireDefault(require("path"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _copyDir = require("copy-dir");

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _sites = _interopRequireWildcard(require("./sites"));

var _sass = _interopRequireDefault(require("sass"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pug = require('pug');

const fs = require('fs');

const rimrafAsync = (0, _util.promisify)(_rimraf.default);

const distPath = _path.default.join(process.cwd(), './dist');

const mkdirpAsync = (0, _util.promisify)(_mkdirp.default);
const readDirAsync = (0, _util.promisify)(fs.readdir);
const sassRenderAsync = (0, _util.promisify)(_sass.default.render);
const readFileAsync = (0, _util.promisify)(fs.readFile);
const tree = {};
Object.keys(_sites.default).forEach(key => {
  tree[key] = _sites.default[key].filter(file => file.indexOf('_') === -1);
});

const cleanStart = async () => {
  logger.info('Re-Create dist folder');
  await rimrafAsync(_path.default.join(distPath, '*'));
};

const bundleAssets = async () => {
  const promiseArray = [];
  Object.keys(tree).forEach(async site => {
    logger.info('Bundling Assets for', site);

    const assetsPath = _path.default.join(distPath, site);

    await mkdirpAsync(assetsPath);
    const p = (0, _copyDir.sync)(_path.default.join(_sites.sitesDir, site, 'assets'), assetsPath);
    promiseArray.push(p);
  });
  return await Promise.all(promiseArray);
};

const bundleHTML = async () => {
  Object.keys(tree).forEach(async site => {
    logger.info('Bundling HTML files for', site);
    await mkdirpAsync(_path.default.join(distPath, site));
    tree[site].forEach(landing => {
      const html = pug.renderFile(_path.default.join(_sites.sitesDir, site, `${landing}.pug`), {
        pretty: true
      });
      fs.writeFileSync(_path.default.join(distPath, site, `${landing}.html`), html);
    });
  });
};

const bundleStyles = async () => {
  const pArray = Object.keys(tree).map(async site => {
    logger.info('Bundling CSS files for', site);

    const stylesDistPath = _path.default.join(distPath, site, 'styles');

    await rimrafAsync(_path.default.join(stylesDistPath, '*'));
    await mkdirpAsync(stylesDistPath);

    const stylesPath = _path.default.join(_sites.sitesDir, site, 'assets/styles');

    const files = await readDirAsync(stylesPath);
    return {
      site,
      files
    };
  });
  const itms = await Promise.all(pArray);
  let toProcess = itms.reduce((acum, {
    site,
    files
  }) => {
    const sassFiles = files.map(f => {
      return _path.default.join(_sites.sitesDir, site, 'assets/styles', f);
    });
    return acum.concat(sassFiles);
  }, []).filter(file => {
    if (_path.default.basename(file)[0] === '_') return false;
    return true;
  });
  let toCopy = toProcess.filter(file => _path.default.extname(file) === '.css').map(async file => {
    const css = await readFileAsync(file);
    return {
      file,
      css
    };
  });
  toCopy = await Promise.all(toCopy);
  toProcess = toProcess.filter(file => _path.default.extname(file) === '.sass').map(async file => {
    const css = await sassRenderAsync({
      file,
      outputStyle: 'compressed'
    });
    return {
      file,
      css: css.css.toString('utf8')
    };
  });
  const rendered = await Promise.all(toProcess);
  const cssData = [].concat(rendered, toCopy).forEach(({
    file,
    css
  }) => {
    const dirname = _path.default.dirname(file);

    let fileName = _path.default.basename(file, '.sass');

    fileName = _path.default.basename(fileName, '.css');
    const site = dirname.replace(_sites.sitesDir, '').replace('/assets/styles', '').replace('/', '');
    fs.writeFileSync(_path.default.join(distPath, site, 'styles', `${fileName}.css`), css);
  });
};

const Builder = async () => {
  await cleanStart();
  await bundleAssets();
  await bundleHTML();
  await bundleStyles();
};

exports.Builder = Builder;