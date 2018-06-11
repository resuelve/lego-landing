import express from 'express'
import request from 'request'
import bodyParser from 'body-parser'

const route = express.Router()
route.use(bodyParser.urlencoded({ extended: false }))
route.use(bodyParser.json())

route.post('/https://buro-api.resuelve.io/api/v1/financial_diagnosis', (req, res) => {
  const options = { 
    method: 'POST',
    url: 'https://buro-api.resuelve.io/api/v1/financial_diagnosis',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: req.body,
    json: true
  };
  setTimeout(() => {
    res.json({
      "status":"success",
      "errors":null,
      "data":{
        "total_debt":12155,
        "total_credit_limit":435568,
        "total_balance_due":5208,
        "score_description":"15",
        "score":662,
        "number_of_queries":18,
        "monthly_debt":944,
        "credits_with_balance_due":2
      }
    })
  }, 1000)

  // request(options, function (error, response, body) {
  //   if (error){
  //     logger.error(error)
  //     res.sendStatus(500)
  //     return
  //   }else{
  //     setTimeout(() => {
  //       res.json(body)
  //     }, 1000)
  //   }
  // });
})

export default route
