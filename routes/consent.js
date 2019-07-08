const { errorWithCode, verifyRequiredParam } = require('../util');
const jwt = require('jsonwebtoken');

const REQUIRED_PARAMS = ['username', 'client_id'];

module.exports = {
    REQUIRED_PARAMS,
    consent: dao => async (req, res, next) => {
        try {
            REQUIRED_PARAMS.forEach(param => verifyRequiredParam(param, req));
            const { username, client_id } = req.body;

            if (!(await dao.loginExists(username))) {
                throw errorWithCode(`Invalid username "${username}"`, 404);
            }

            if (!(await dao.getClient(client_id))) {
                throw errorWithCode(`Invalid client_id "${client_id}"`, 404);
            }

            const success = await dao.addUserConsent(username, client_id);
            if (!success) {
                throw errorWithCode(`An internal server error occurred`);
            }

            const id_token = jwt.sign({ dat: 'boi' }, 'supersecret');
            res.json(JSON.stringify({ id_token }));
        } catch (err) {
            next(err);
        }
    }
};
