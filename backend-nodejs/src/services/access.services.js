'use strict'

class AccessService {
    static signUp = async (req) => {
        try{
            console.log(req.field)
            return {
                code: '200',
                message: `Loaded`
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