import express from 'express'
const app = express()

app.get('/', (req,res) => {
  res.sendStatus(200)
})

app.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT}`)
})
