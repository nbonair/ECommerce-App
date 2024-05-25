const apikeyModel = require("../models/apikey.model")
const crypto = require("crypto")
const findByKey = async (key) => {
    const objKey = await apikeyModel.findOne({ key, status: true }).lean()
    return objKey
}

const createNewKey = async () => {
    const newKey = await apikeyModel.create({ key: crypto.randomBytes(64).toString('hex'), permissions: '0' })
}

module.exports = {
    findByKey
}