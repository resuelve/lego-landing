"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));

require("./logger");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

const config = {};
config.PORT = process.env.PORT;
global.config = config;