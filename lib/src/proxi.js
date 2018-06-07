import express from 'express'
import request from 'request'
import bodyParser from 'body-parser'

const route = express.Router()
route.use(bodyParser.urlencoded({ extended: false }))
route.use(bodyParser.json())

route.post('/https://buro-api.resuelve.io/api/v1/buro', (req, res) => {
  const options = { 
    method: 'POST',
    url: 'https://buro-api.resuelve.io/api/v1/buro',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: req.body,
    json: true
  };
  // setTimeout(() => {
  //   res.json({})
  // }, 10000)
  request(options, function (error, response, body) {
    if (error){
      logger.error(error)
      res.sendStatus(500)
      return
    }else{
      res.json(body)
    }
  });
})

export default route
