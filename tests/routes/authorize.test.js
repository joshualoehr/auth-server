const expect = require('chai').expect;
const sinon = require('sinon');

const Dao = require('../../dao');
let dao = sinon.createStubInstance(Dao);

let { authorize } = require('../../routes/authorize');
let req, res;

beforeEach(() => {
    req = {
        body: {}
    };
});

afterEach(() => {
    sinon.restore();
});

const validRequestParams = {
    scope: 'openid',
    response_type: 'id_token token',
    client_id: 'app123',
    redirect_uri: 'http://localhost:3000'
};

const testRequiredParam = param => async () => {
    req.body = { ...validRequestParams, [param]: null };

    let next = sinon.spy();
    await authorize(dao)(req, res, next);

    expect(next.getCall(0).args[0].statusCode).to.equal(400);
};

describe('Authorize Route', () => {
    describe('Implicit Flow', () => {
        ['scope', 'response_type', 'client_id', 'redirect_uri'].forEach(param => {
            it(`Should return 400 error when ${param} is not provided`, testRequiredParam(param));
        });
        it('Should return 400 error when response_type is neither "id_token" nor "id_token token"', async () => {
            req.body = { ...validRequestParams, response_type: 'code' };

            let next = sinon.spy();
            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should return 400 error when redirect_uri malformed"', async () => {
            req.body = { ...validRequestParams, redirect_uri: 'asdf' };

            let next = sinon.spy();
            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should return 400 error when redirect_uri uses http without localhost"', async () => {
            req.body = { ...validRequestParams, redirect_uri: 'http://www.google.com' };

            let next = sinon.spy();
            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);

            req.body = { ...validRequestParams, redirect_uri: 'http://localhost.fakeout.com' };

            await authorize(dao)(req, res, next);
            expect(next.getCall(1).args[0].statusCode).to.equal(400);
        });
        it('Should return 404 error when login does not exist', async () => {
            req.body = validRequestParams;

            dao.checkLoginExists.returns(Promise.resolve(false));

            let next = sinon.spy();
            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(404);
        });
        it('Should return 401 error when incorrect password provided', async () => {
            req.body = validRequestParams;

            dao.checkLoginExists.returns(Promise.resolve(true));
            dao.getUser.returns(Promise.resolve(null));

            let next = sinon.spy();
            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(401);
        });
    });
});
