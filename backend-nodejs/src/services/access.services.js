

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const { createTokensPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { ConflictRequestError, BadRequestError, AuthFailureError } = require('../../core/error.response')

//services
const KeyTokenService = require('./keyToken.service')
const { findByEmail } = require('./shop.services')
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: '0001',
    EDITOR: '0001',
    ADMIN: '0001'
}

class AccessService {
    static login = async ({ email, password, refreshToken = null }) => {
        /*
            check email
            match pw
            create accessToken/refreshToken
            generate tokens
            get data/login
        */
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new BadRequestError('Shop not registered')

        const isMatch = bcrypt.compare(password, foundShop.password)
        if (!isMatch) throw new AuthFailureError('Authentication Error')

        //Create token
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        const tokens = await createTokensPair({ userID: foundShop._id, email }, publicKey, privateKey)

        // Refresh Token 
        await KeyTokenService.createKeyToken({

        })
        return {
            metadata: {
                shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
                tokens
            }
        }
    }

    static signUp = async ({ name, email, password }) => {

        const shopObj = await shopModel.findOne({ email }).lean()
        if (shopObj) {
            throw new BadRequestError('Error: Shop already registered')
        }
        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })
        if (newShop) {

            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if (!keyStore) {
                throw new BadRequestError("Create Shop Error")
            }

            //create token pair
            const tokens = await createTokensPair({ userId: newShop._id, email }, publicKey, privateKey)

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }
        }

    }
}

module.exports = AccessService