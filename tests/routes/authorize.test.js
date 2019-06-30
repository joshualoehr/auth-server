const expect = require('chai').expect;
const sinon = require('sinon');

const Dao = require('../../dao');
let dao = sinon.createStubInstance(Dao);

let { authorize, REQUIRED_PARAMS } = require('../../routes/authorize');
let req, res, next;

beforeEach(() => {
    req = {
        body: {}
    };
    next = sinon.spy();
});

afterEach(() => {
    sinon.restore();
});

const validRequestParams = {
    scope: 'openid',
    response_type: 'id_token token',
    client_id: 'app123',
    redirect_uri: 'http://localhost:3000',
    nonce: '66eb5d10422547ea51f97b4416d3a73c'
};

const testRequiredParam = param => async () => {
    req.body = { ...validRequestParams, [param]: null };

    let next = sinon.spy();
    await authorize(dao)(req, res, next);

    expect(next.getCall(0).args[0].statusCode).to.equal(400);
};

describe('Authorize Route', () => {
    describe('Implicit Flow', () => {
        REQUIRED_PARAMS.forEach(param => {
            it(`Should return 400 error when ${param} is not provided`, testRequiredParam(param));
        });
        it('Should return 400 error when response_type is neither "id_token" nor "id_token token"', async () => {
            req.body = { ...validRequestParams, response_type: 'code' };

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should return 400 error when redirect_uri malformed"', async () => {
            req.body = { ...validRequestParams, redirect_uri: 'asdf' };

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should return 400 error when redirect_uri uses http without localhost"', async () => {
            req.body = { ...validRequestParams, redirect_uri: 'http://www.google.com' };

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);

            req.body = { ...validRequestParams, redirect_uri: 'http://localhost.fakeout.com' };

            await authorize(dao)(req, res, next);
            expect(next.getCall(1).args[0].statusCode).to.equal(400);
        });
        it('Should not return 400 error when all required params are provided and valid', async () => {
            req.body = validRequestParams;

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.not.equal(400);
        });
        it('Should return 404 error when login does not exist', async () => {
            req.body = validRequestParams;

            dao.checkLoginExists.returns(Promise.resolve(false));

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(404);
        });
        it('Should return 401 error when incorrect password provided', async () => {
            req.body = validRequestParams;

            dao.checkLoginExists.returns(Promise.resolve(true));
            dao.getUser.returns(Promise.resolve(null));

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(401);
        });
    });
});
