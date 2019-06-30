const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Initialize database connection
const mysql = require('mysql');
const conn = mysql.createConnection(require('./db_config.json'));
const Dao = require('./dao');
const dao = new Dao(conn);

// Configure middleware
app.use(bodyParser.json());
app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});

// Configure routes
const { authorize } = require('./routes/authorize');
app.post('/authorize', authorize(dao));
app.get('*', (req, res, next) => {
    let err = new Error('Page Not Found');
    err.statusCode = 404;
    next(err);
});

app.listen(3001, () => console.log('Auth server listening on port 3001...'));
