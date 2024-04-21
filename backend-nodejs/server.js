const app = require("./src/app");

const PORT = process.env.PORT || 3055

const server = app.listen( PORT, () => {
    console.log(`eCommerce Web Server start at port: ${PORT}`)
})

process.on('SIGINT', () => {
    server.close(() => console.log(`Exit Server Express`))
})