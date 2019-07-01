const { errorWithCode } = require('../util');

const REQUIRED_PARAMS = ['username', 'password'];

const verifyRequiredParam = (param, req) => {
    if (!req.body[param]) {
        throw errorWithCode(`${param} is a required parameter`, 400);
    }
};

module.exports = {
    REQUIRED_PARAMS,
    login: dao => async (req, res, next) => {
        try {
            REQUIRED_PARAMS.forEach(param => verifyRequiredParam(param, req));
        } catch (err) {
            next(err);
        }
    }
};
