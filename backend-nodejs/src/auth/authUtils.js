const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../../core/error.response')
const keytokenModel = require('../models/keytoken.model')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESH_TOKEN: 'x-rtoken-id'
}

const createTokensPair = async (payload, privateKey, publicKey) => {
    try {
        const accessToken = JWT.sign(payload, privateKey, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
            algorithm: process.env.JWT_ALGORITHM
        });

        const refreshToken = JWT.sign(payload, privateKey, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
            algorithm: process.env.JWT_ALGORITHM
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Error creating tokens pair:', error);
        throw new Error('Token creation failed');
    }
};

const verifyToken = async (token, key) => {
    try {
        return JWT.verify(token, key, { algorithms: [process.env.JWT_ALGORITHM] });
    } catch (error) {
        console.error('Token verification error:', error);
        throw new AuthFailureError('Invalid token');
    }
};


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
    if (!userId) throw new AuthFailureError('Invalid Request. Client ID missing')

    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Key Store Not Found')

    //3.1 if refresh token exist
    if (req.headers[HEADER.REFRESH_TOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
            const decodedUser = await JWT.verify(refreshToken, keyStore.privateKey)
            if (userId != decodedUser.userId) throw new AuthFailureError('Invalid UserId')
            console.log(decodedUser)
            // Add decoded to middleware for token-used verification
            req.keyStore = keyStore
            req.user = decodedUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }

    //3.2 Check access token
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