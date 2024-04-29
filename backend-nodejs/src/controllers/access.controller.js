const AccessService = require("../services/access.services");

const {OK, CREATED} = require('../../core/success.response')

class AccessController {
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registered Successfully",
            metadata: await AccessService.signUp(req.body)
        }).send(res)
    }
}

module.exports = new AccessController();
