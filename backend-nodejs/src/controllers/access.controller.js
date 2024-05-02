const AccessService = require("../services/access.services");

const {OK, CREATED, SuccessResponse} = require('../../core/success.response')

class AccessController {
    login  = async (req, res, next) => {
        new SuccessResponse({
            message: "Login Successfully",
            metadata: await AccessService.login(req.body)
        }).send(res)
    }
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registered Successfully",
            metadata: await AccessService.signUp(req.body)
        }).send(res)
    }
}

module.exports = new AccessController();
