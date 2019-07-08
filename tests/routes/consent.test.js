const expect = require('chai').expect;
const sinon = require('sinon');

const Dao = require('../../dao');
let dao = sinon.createStubInstance(Dao);

let { consent, REQUIRED_PARAMS } = require('../../routes/consent');
let req, res, next;

const validRequestParams = {
    username: 'username',
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

    await consent(dao)(req, res, next);

    expect(next.getCall(0).args[0].statusCode).to.equal(400);
};

describe('/consent', () => {
    REQUIRED_PARAMS.forEach(param => {
        it(`Should return 400 error when ${param} is not provided`, testRequiredParam(param));
    });
    it('Should return 404 error when username is invalid', async () => {
        dao.loginExists.returns(Promise.resolve(false));

        await consent(dao)(req, res, next);

        expect(next.getCall(0).args[0].statusCode).to.equal(404);
    });
    it('Should return 404 error when client_id is invalid', async () => {
        dao.getClient.returns(Promise.resolve(null));

        await consent(dao)(req, res, next);

        expect(next.getCall(0).args[0].statusCode).to.equal(404);
    });
    // it('Should return a JSON user object when all required params are provided and valid', async () => {
    //     dao.getUser.returns(Promise.resolve({ user_id: 123 }));

    //     await consent(dao)(req, res, next);

    //     expect(next.called).to.equal(false);
    //     expect(res.json.called).to.equal(true);
    // });
});
