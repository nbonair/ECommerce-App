

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokensPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
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
            const passwordHash = await bcrypt.hash(password, 10)

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            // Create token for shop to insert items to production database
            if (newShop){
                // created privateKey, publicKey using pem and RSA format
                // const { privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')


                console.log({privateKey, publicKey}) 

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey, 
                    privateKey
                })

                if (!keyStore){
                    return {
                        code: '',
                        message:"Generate keys error"
                    }
                }

                //create token pair
                const tokens = await createTokensPair({userId:newShop._id, email}, publicKey, privateKey)
                console.log(`create Token Success::`, tokens)

                return{
                    code: 201,
                    metadata: {
                        shop:getInfoData({fields: ['_id','name', 'email'], object:newShop}),
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