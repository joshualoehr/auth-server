const { errorWithCode } = require('../util');

const verifyRequiredParam = (param, req) => {
    if (!req.body[param]) {
        throw errorWithCode(`${param} is a required parameter`, 400);
    }
};

// For implicit flow, response_type is required to include "id_token".
// In addition, "token" is also allowed; all others are ignored.
const validateResponseType = response_type => {
    const parsed = response_type.split(' ').reduce((response_types, type) => {
        return { ...response_types, [type]: true };
    }, {});

    if (!parsed.id_token) {
        throw errorWithCode(`Invalid response_type "${response_type}"`, 400);
    }

    return parsed;
};

// For implicit flow, redirect_uri must use https, with http://localhost:xxxx as an exception.
const validateRedirectUri = redirect_uri => {
    const regex = /http:\/\/localhost(:\d+)?(\/|$).*/g;
    if (redirect_uri.startsWith('http:') && !redirect_uri.match(regex)) {
        throw errorWithCode(`Invalid redirect_uri "${redirect_uri}" (may only use http scheme for localhost)`, 400);
    }
    if (!redirect_uri.startsWith('https')) {
        throw errorWithCode(`Invalid redirect_uri "${redirect_uri}" (only localhost may use http)`, 400);
    }
    return redirect_uri;
};

module.exports = {
    authorize: dao => async (req, res, next) => {
        try {
            const requiredParams = ['scope', 'response_type', 'client_id', 'redirect_uri'];
            requiredParams.forEach(param => verifyRequiredParam(param, req));

            const { scope, response_type, client_id, redirect_uri } = req.body;
            const config = {};

            config.response_type = validateResponseType(response_type);
            config.redirect_uri = validateRedirectUri(redirect_uri);

            const { login, password } = req.body;

            const exists = await dao.checkLoginExists(login);
            if (!exists) {
                throw errorWithCode(`Login ${login} Not Found`, 404);
            }

            const user = await dao.getUser(login, password);
            if (!user) {
                throw errorWithCode('Invalid login/password combination', 401);
            }

            delete user.password_id;
            res.send(JSON.stringify(user));
        } catch (err) {
            next(err);
        }
    }
};
