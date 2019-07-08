const express = require('express');
const mustacheExpress = require('mustache-express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// Initialize database connection
const mysql = require('mysql');
const conn = mysql.createConnection(require('./db_config.json'));
const Dao = require('./dao');
const dao = new Dao(conn);

// Configure middleware
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/public');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send({ message: err.message });
});

// Configure routes
const { authorize } = require('./routes/authorize');
const { login } = require('./routes/login');
const { consent } = require('./routes/consent');
app.get('/', (req, res) => {
    const params = {
        scope: 'openid',
        response_type: 'id_token token',
        client_id: 'testApp',
        redirect_uri: 'http://localhost:3001/redirect',
        nonce: 'xyz123'
    };
    const urlParams = Object.entries(params).reduce((url, [key, val]) => `${url}&${key}=${val}`, '');
    res.redirect(encodeURI(`/authorize?${urlParams}`));
});
app.get('/authorize', (req, res, next) => {
    req.body = req.query;
    authorize(dao)(req, res, next);
});
app.post('/authorize', authorize(dao));
app.post('/login', login(dao));
app.post('/consent', consent(dao));
app.get('/redirect', (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.verify(req.query.id_token, 'supersecret');
    res.send(JSON.stringify(token));
});
app.get('*', (req, res, next) => {
    let err = new Error('Page Not Found');
    err.statusCode = 404;
    next(err);
});

app.listen(3001, () => console.log('Auth server listening on port 3001...'));
