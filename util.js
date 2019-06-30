module.exports = {
    errorWithCode: (error, statusCode = 500) => {
        let err = new Error(error);
        err.statusCode = statusCode;
        return err;
    }
};
