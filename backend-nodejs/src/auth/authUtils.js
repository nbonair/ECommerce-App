const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../../core/error.response')
const keytokenModel = require('../models/keytoken.model')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESH_TOKEN: 'refresh_token'
}

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
        throw error
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /*
        Middleware to authorize user
        1 - UserId missing
        2 - Get Access Token
        3 - Verify Token
        4 - Check user existence
        5 - Check keyStore with userId
        6 - return next
    */
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')

    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Key Store Not Found')

    //3
    if (req.headers[HEADER.REFRESH_TOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
            const decodedUser = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId != decodedUser.userId) throw new AuthFailureError('Invalid UserId')
            req.keyStore = keyStore
            req.user = decodedUser
            req.refreshToken = refreshToken
            return next()
        } catch (error){
            throw error
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid Request')
    try {
        const decodedUser = JWT.verify(accessToken, keyStore.privateKey)
        if (userId !== decodedUser.userId) throw new AuthFailureError('Invalid User')
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
})


module.exports = {
    createTokensPair,
    authentication
}