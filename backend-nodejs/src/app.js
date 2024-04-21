require('dotenv').config()
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const app = express()

console.log(`Process::`, process.env)
// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json());


// init db
// require('./dbs/init.mongodb')
// const { checkOverload } = require('./helpers/check.connect')
console.log(`Connection String: `)

// init routes
app.use('/', require('./routes/'))
module.exports = app