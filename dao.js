const { errorWithCode } = require('./util');

const Dao = function(connection) {
    this.db = connection;
    this.db.connect();
};

Dao.prototype.checkLoginExists = function(login) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(*) AS cnt
                     FROM auth.users
                    WHERE login = ?`;
        this.db.query(sql, [login], (error, rows) => {
            if (error) {
                reject(errorWithCode(error));
            } else {
                resolve(rows[0].cnt > 0);
            }
        });
    });
};

Dao.prototype.getUser = function(login, password) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT u.* 
                 FROM auth.users u
           INNER JOIN auth.passwords p ON p.password_id = u.password_id
                WHERE u.login = ?
                  AND p.password_hash = SHA2(?, 256)`;
        this.db.query(sql, [login, password], (error, rows) => {
            if (error) {
                reject(errorWithCode(error));
            } else {
                resolve(rows.length ? rows[0] : null);
            }
        });
    });
};

module.exports = Dao;
