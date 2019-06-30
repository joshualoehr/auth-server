const expect = require('chai').expect;
const sinon = require('sinon');

const Dao = require('../../dao');
let dao = sinon.createStubInstance(Dao);

let { authorize, REQUIRED_PARAMS } = require('../../routes/authorize');
let req, res, next;

const validRequestParams = {
    scope: 'openid',
    response_type: 'id_token token',
    client_id: 'app123',
    redirect_uri: 'http://localhost:3000',
    nonce: '66eb5d10422547ea51f97b4416d3a73c'
};

const validClient = {
    client_id: validRequestParams.client_id,
    client_secret: 'secret',
    redirect_uri: validRequestParams.redirect_uri
};

beforeEach(() => {
    req = { body: { ...validRequestParams } };
    next = sinon.spy();
});

afterEach(() => {
    sinon.restore();
});

const testRequiredParam = param => async () => {
    delete req.body[param];

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
            req.body.response_type = 'code';

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should return 404 error when provided client_id does not exist', async () => {
            dao.getClient.returns(Promise.resolve(null));

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(404);
        });
        it('Should return 400 error when redirect_uri malformed"', async () => {
            dao.getClient.returns(Promise.resolve(validClient));
            req.body.redirect_uri = 'asdf';

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should return 400 error when redirect_uri uses http without localhost"', async () => {
            dao.getClient.returns(Promise.resolve(validClient));
            req.body.redirect_uri = 'http://www.google.com';

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);

            req.body.redirect_uri = 'http://localhost.fakeout.com';

            await authorize(dao)(req, res, next);
            expect(next.getCall(1).args[0].statusCode).to.equal(400);
        });
        it('Should return 400 error when redirect_uri is not associated with provided client_id', async () => {
            dao.getClient.returns(Promise.resolve(validClient));
            req.body.redirect_uri = 'https://www.google.com';

            await authorize(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should not return 4XX error when all required params are provided and valid', async () => {
            dao.getClient.returns(Promise.resolve(validClient));

            await authorize(dao)(req, res, next);

            const returnedErrorCode = next
                .getCall(0)
                .args[0].statusCode.toString()
                .startsWith('4');
            expect(returnedErrorCode).to.equal(false);
        });
        // it('Should return 404 error when login does not exist', async () => {
        //     dao.checkLoginExists.returns(Promise.resolve(false));

        //     await authorize(dao)(req, res, next);

        //     expect(next.getCall(0).args[0].statusCode).to.equal(404);
        // });
        // it('Should return 401 error when incorrect password provided', async () => {
        //     dao.checkLoginExists.returns(Promise.resolve(true));
        //     dao.getUser.returns(Promise.resolve(null));

        //     await authorize(dao)(req, res, next);

        //     expect(next.getCall(0).args[0].statusCode).to.equal(401);
        // });
    });
});
