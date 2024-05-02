const crypto = require('node:crypto')

const createKey = () => {
    return crypto.randomBytes(64).toString('hex')
}

module.exports = {createKey}