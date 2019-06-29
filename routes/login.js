module.exports = {
    login: (req, res, next) => {
        let err;

        const requiredArgs = ['login', 'password'];
        requiredArgs.some(arg => {
            if (!req.body[arg]) {
                err = new Error(`${arg} is a required parameter`);
                err.statusCode = 400;
                return true;
            }
        });

        if (err) {
            next(err);
            return;
        }
    }
};
