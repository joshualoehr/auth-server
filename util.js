const errorWithCode = (error, statusCode = 500) => {
    let err = new Error(error);
    err.statusCode = statusCode;
    return err;
};

const verifyRequiredParam = (param, req) => {
    if (!req.body[param]) {
        throw errorWithCode(`${param} is a required parameter`, 400);
    }
};

module.exports = {
    errorWithCode,
    verifyRequiredParam
};
