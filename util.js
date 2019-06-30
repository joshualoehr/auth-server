module.exports = {
    errorWithCode: (error, statusCode = 500) => ({ statusCode, ...new Error(error) })
};
