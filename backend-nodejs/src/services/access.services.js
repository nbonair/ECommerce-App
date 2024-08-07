const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const { createTokensPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { ConflictRequestError, BadRequestError, AuthFailureError, ForbiddenError } = require('../../core/error.response')

//services
const KeyTokenService = require('./keyToken.service')
const { findByEmail } = require('./shop.services')
const { createKey } = require('../utils/createKey')
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: '0001',
    EDITOR: '0001',
    ADMIN: '0001'
}

class AccessService {

    static handlerRefreshToken = async ({ keyStore, user, refreshToken }) => {
        const { userId, email } = user
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.removeKeyById(keyStore._id)
            throw new ForbiddenError('Key Token Verification Error. Please Login again')
        }

        if (keyStore.refreshToken != refreshToken) throw new AuthFailureError('Invalid refresh token')

        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop not registered')

        const tokens = await createTokensPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

        keyStore.refreshToken = tokens.refreshToken;
        await keyStore.updateOne({
            $set: { refreshToken: tokens.refreshToken },
            $addToSet: { refreshTokensUsed: refreshToken }
        });

        return {
            user,
            tokens
        }

    }

    static logout = async (keyStore) => {
        return await KeyTokenService.removeKeyById(keyStore._id)
    }

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
        const isMatch = await bcrypt.compare(password, foundShop.password)
        if (!isMatch) throw new AuthFailureError('Authentication Error')

        //Create token
        const privateKey = createKey()
        const tokens = await createTokensPair({ userId: foundShop._id, email }, privateKey)
        await KeyTokenService.createKeyToken({ userId: foundShop._id, privateKey, refreshToken: tokens.refreshToken })

        return {
            code: 200,
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

            const privateKey = createKey()
            //create token pair and refresh token
            const tokens = await createTokensPair({ userId: newShop._id, email }, privateKey)

            await KeyTokenService.createKeyToken({ userId: newShop._id, privateKey, refreshToken: tokens.refreshToken, })

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