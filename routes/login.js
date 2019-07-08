const { errorWithCode, verifyRequiredParam } = require('../util');

const REQUIRED_PARAMS = ['username', 'password', 'client_id'];

module.exports = {
    REQUIRED_PARAMS,
    login: dao => async (req, res, next) => {
        try {
            REQUIRED_PARAMS.forEach(param => verifyRequiredParam(param, req));
            const { username, password, client_id } = req.body;

            const user = await dao.getUser(username, password);
            if (!user) {
                throw errorWithCode('Invalid username/password', 401);
            }

            const consent = await dao.getUserConsent(user, client_id);

            res.json({ user, consent });
        } catch (err) {
            next(err);
        }
    }
};
