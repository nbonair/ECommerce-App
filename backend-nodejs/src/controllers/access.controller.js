const AccessService = require("../services/access.services");

const { OK, CREATED, SuccessResponse } = require('../../core/success.response')

class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: "Get Token Successfully",
            metadata: await AccessService.handlerRefreshToken({
                refreshToken: req.refreshToken,
                keyStore: req.keyStore,
                user: req.user
            })
        }).send(res)
    }

    login = async (req, res, next) => {
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
    logout = async (req, res, next) => {
        new SuccessResponse({
            message: "Logout Successfully",
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }
}

module.exports = new AccessController();
