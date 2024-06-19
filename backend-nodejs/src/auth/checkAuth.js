const { ForbiddenError } = require("../../core/error.response")
const { asyncHandler } = require("../utils/asyncHandler")
const { findByKey } = require("../services/apikey.service")

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const apiKey = asyncHandler(async (req, res, next) => {
    const key = req.headers[HEADER.API_KEY]?.toString()
    if (!key) throw new ForbiddenError('Missing API key')
    //check obj APIKey
    const objKey = await findByKey(key)
    if (!objKey) throw new ForbiddenError('API Key not found')

    req.objKey = objKey
    return next()
})

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }

        console.log(req.objKey.permissions)
        const validPermission = req.objKey.permissions.includes(permission)
        if (!validPermission) {
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }

        return next()
    }
}

module.exports = {
    apiKey,
    permission
}