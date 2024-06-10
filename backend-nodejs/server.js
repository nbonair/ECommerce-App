const app = require("./src/app");
// init db
const mongooseClient = require('./src/dbs/init.mongodb')
const PORT = process.env.PORT || 3055

const server = app.listen(PORT, () => {
    console.log(`eCommerce Web Server start at port: ${PORT}`)
})

const onClose = async () => {
    console.log('Closing HTTP server')
    server.close(async () => {
        await mongooseClient.disconnect()
        console.log('Exit Server Express')
    })
}
process.on('SIGINT', onClose)