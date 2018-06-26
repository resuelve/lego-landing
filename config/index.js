import dotenv from 'dotenv'
import './logger'

dotenv.config()
const config = {}

config.PORT = process.env.PORT

global.config = config
