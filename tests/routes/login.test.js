const expect = require('chai').expect;
const sinon = require('sinon');

const Dao = require('../../dao');
let dao = sinon.createStubInstance(Dao);

let { login, REQUIRED_PARAMS } = require('../../routes/login');
let req, res, next;

const validRequestParams = {
    username: 'username',
    password: 'password',
    client_id: 'App123'
};

beforeEach(() => {
    req = { body: { ...validRequestParams } };
    res = { json: sinon.spy() };
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
    it('Should return 401 error when username/password combination is invalid', async () => {
        dao.getUser.returns(Promise.resolve(null));

        await login(dao)(req, res, next);

        expect(next.getCall(0).args[0].statusCode).to.equal(401);
    });
    it('Should return a JSON user object when all required params are provided and valid', async () => {
        dao.getUser.returns(Promise.resolve({ user_id: 123 }));

        await login(dao)(req, res, next);

        expect(next.called).to.equal(false);
        expect(res.json.called).to.equal(true);
    });
});
