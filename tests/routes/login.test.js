const expect = require('chai').expect;
const sinon = require('sinon');

const Dao = require('../../dao');
let dao = sinon.createStubInstance(Dao);

let { login } = require('../../routes/login');
let req, res;

beforeEach(() => {
    req = {
        body: {}
    };
});

afterEach(() => {
    sinon.restore();
});

describe('Login Route', () => {
    describe('Login() function', () => {
        it('Should return 400 error when login is not provided', async () => {
            req.body.password = 'password';

            let next = sinon.spy();
            await login(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should return 400 error when password is not provided', async () => {
            req.body.login = 'login';

            let next = sinon.spy();
            await login(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(400);
        });
        it('Should return 404 error when login does not exist', async () => {
            req.body = { login: 'login', password: 'password' };

            dao.checkLoginExists.returns(Promise.resolve(false));

            let next = sinon.spy();
            await login(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(404);
        });
        it('Should return 401 error when incorrect password provided', async () => {
            req.body = { login: 'login', password: 'password' };

            dao.checkLoginExists.returns(Promise.resolve(true));
            dao.getUser.returns(Promise.resolve(null));

            let next = sinon.spy();
            await login(dao)(req, res, next);

            expect(next.getCall(0).args[0].statusCode).to.equal(401);
        });
    });
});
