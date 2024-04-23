

const keytokenModel = require("../models/keytoken.model")

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey }) => {
        const tokens = keytokenModel.create({
            user: userId,
            publicKey,
            privateKey
        })
        return tokens ? publicKey : null

    }
}

module.exports = KeyTokenService