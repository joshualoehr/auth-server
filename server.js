const express = require('express');
const app = express();

// Initialize database connection
const mysql = require('mysql');
const conn = mysql.createConnection(require('./db_config.json'));
conn.connect();

// Configure error handling middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});

// Configure routes
const { login } = require('./routes/login');
app.post('/login', login);
app.get('*', (req, res, next) => {
    let err = new Error('Page Not Found');
    err.statusCode = 404;
    next(err);
});

app.listen(3001, () => console.log('Auth server listening on port 3001...'));
