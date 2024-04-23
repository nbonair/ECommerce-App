

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

        // JWT.verify(accessToken, publicKey, (err, decode) =>{
        //     if (err){
        //         console.log(`Error verification::`, err)
        //     }else{
        //         console.log(`Decoded verification::`, decode)
        //     }
        // })

        return { accessToken, refreshToken }
    } catch (error) {
        return error
    }
}

module.exports = {
    createTokensPair
}