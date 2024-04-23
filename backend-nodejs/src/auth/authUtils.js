

const JWT = require('jsonwebtoken')
const createTokensPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken

        const accessToken = await JWT.sign(payload, privateKey, {
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        return { accessToken, refreshToken }
    } catch (error) {
        return error
    }
}

module.exports = {
    createTokensPair
}