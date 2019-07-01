const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// Initialize database connection
const mysql = require('mysql');
const conn = mysql.createConnection(require('./db_config.json'));
const Dao = require('./dao');
const dao = new Dao(conn);

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});

// Configure routes
const { authorize, login } = require('./routes/authorize');
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/index.html'));
});
app.get('/authorize', (req, res, next) => {
    req.body = req.query;
    authorize(dao)(req, res, next);
});
app.post('/authorize', authorize(dao));
app.post('/login', login(dao));
app.get('*', (req, res, next) => {
    let err = new Error('Page Not Found');
    err.statusCode = 404;
    next(err);
});

app.listen(3001, () => console.log('Auth server listening on port 3001...'));
