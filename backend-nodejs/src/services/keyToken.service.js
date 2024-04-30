

const keytokenModel = require("../models/keytoken.model")

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey }) => {
        //simple version
        // const tokens = keytokenModel.create({
        //     user: userId,
        //     publicKey,
        //     privateKey
        // })
        // return tokens ? publicKey : null
        const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
    }
}

module.exports = KeyTokenService