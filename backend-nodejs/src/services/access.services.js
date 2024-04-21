'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokensPair } = require('../auth/authUtils')
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: '0001',
    EDITOR: '0001',
    ADMIN: '0001'
}

class AccessService {
    static signUp = async ({name, email, password}) => {
        try{
            const shopObj = await shopModel.findOne({email}).lean()
            if (shopObj){
                return {
                    code: '4001',
                    message: 'Shop already registered'
                }
            }

            // Create new shop
            const passwordHash = await bcrypt.hash(password, 10)

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            // Create token for shop to insert items to production database
            if (newShop){
                // created privateKey, publicKey
                const { privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    }
                })

                console.log({privateKey, publicKey}) // save to collection KeyStore

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey
                })

                if (!publicKeyString){
                    return {
                        code: '',
                        message:"Generate public key error"
                    }
                }
                console.log(publicKeyString)
                const publicKeyObj = crypto.createPublicKey(publicKeyString)
                console.log(publicKeyObj)
                //create token pair
                const tokens = await createTokensPair({userId:newShop._id, email}, publicKeyString, privateKey)
                console.log(`create Token Success::`, tokens)

                return{
                    code: 201,
                    metadata: {
                        shop: newShop,
                        tokens
                    }
                }
            }
        } catch (error) {
            return {
                code: '',
                message: error.message,
                status: 'error'
            }
        }

    }
}

module.exports = AccessService