import express from 'express'
import request from 'request'
import bodyParser from 'body-parser'
import memoize from 'memoizee'

const route = express.Router()
route.use(bodyParser.urlencoded({ extended: false }))
route.use(bodyParser.json())

const requester = (url, payload, cb) => {
  const options = { 
    method: 'POST',
    url: url,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.parse(payload),
    json: true
  }
  request(options, cb)
}
const memoized = memoize(requester, { async: true })

route.post('/https://buro-api.resuelve.io/api/v1/financial_diagnosis', (req, res) => {
  setTimeout(() => {
    memoized(
      'https://buro-api.resuelve.io/api/v1/financial_diagnosis',
      JSON.stringify(req.body),
      (error, response, body) => {
      if (error) {
        logger.error(error)
        res.sendStatus(500)
        return
      } else {
        setTimeout(() => {
          res.json(body)
        }, 1000)
      }
    })
  }, 1000)
})

export default route
