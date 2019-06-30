const { errorWithCode } = require('../util');

module.exports = {
    login: dao => async (req, res, next) => {
        try {
            const requiredArgs = ['login', 'password'];
            requiredArgs.forEach(arg => {
                if (!req.body[arg]) {
                    throw errorWithCode(`${arg} is a required parameter`, 400);
                }
            });

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
