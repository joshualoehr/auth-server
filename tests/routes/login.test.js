const expect = require('chai').expect;

const { login } = require('../../routes/login');

let req, res, next;

beforeEach(() => {
    req = {
        body: {}
    };
    res = {
        sendCalledWith: '',
        send: function(arg) {
            this.sendCalledWith = arg;
        }
    };
    next = err => (res = err);
});

describe('Login Route', () => {
    describe('Login() function', () => {
        it('Should return 400 error when login is not provided', () => {
            req.body.password = 'password';
            login(req, res, next);
            expect(res.statusCode).to.equal(400);
        });
        it('Should return 400 error when password is not provided', () => {
            req.body.login = 'login';
            login(req, res, next);
            expect(res.statusCode).to.equal(400);
        });
    });
});
