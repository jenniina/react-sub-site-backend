import express, { Express } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import routes from './routes'

require('dotenv').config()

const app: Express = express()

const PORT: string | number = process.env.PORT || 4000

app.options('*', cors())

app.use(routes)
app.use(cors({ origin: '*' }))
app.use(express.json())
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }))
app.use(express.static('dist'))

const uri: string = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}.zzpvtsc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
const options = { useNewUrlParser: true, useUnifiedTopology: true }

mongoose
  .connect(uri)
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  )
  .catch((error) => {
    throw error
  })
