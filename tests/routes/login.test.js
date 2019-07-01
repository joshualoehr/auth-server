const expect = require('chai').expect;
const sinon = require('sinon');

const Dao = require('../../dao');
let dao = sinon.createStubInstance(Dao);

let { login, REQUIRED_PARAMS } = require('../../routes/login');
let req, res, next;

const validRequestParams = {
    username: 'username',
    password: 'password'
};

beforeEach(() => {
    req = { body: { ...validRequestParams } };
    res = {};
    next = sinon.spy();
});

afterEach(() => {
    sinon.restore();
});

const testRequiredParam = param => async () => {
    delete req.body[param];

    await login(dao)(req, res, next);

    expect(next.getCall(0).args[0].statusCode).to.equal(400);
};

describe('/login', () => {
    REQUIRED_PARAMS.forEach(param => {
        it(`Should return 400 error when ${param} is not provided`, testRequiredParam(param));
    });
});
