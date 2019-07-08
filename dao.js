const { errorWithCode } = require('./util');

class Dao {
    constructor(connection) {
        this.db = connection;
        this.db.connect();
    }

    getClient(client_id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM auth.oauth_clients WHERE client_id = ?`;
            this.db.query(sql, [client_id], (error, rows) => {
                if (error) {
                    reject(errorWithCode(error));
                } else {
                    resolve(rows.length ? rows[0] : null);
                }
            });
        });
    }

    loginExists(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) AS cnt FROM auth.users WHERE login = ?`;
            this.db.query(sql, [username], (error, rows) => {
                if (error) {
                    reject(errorWithCode(error));
                } else {
                    resolve(rows[0].cnt > 0);
                }
            });
        });
    }

    getUser(username, password) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT u.* 
                           FROM auth.users u
                     INNER JOIN auth.passwords p ON p.password_id = u.password_id
                          WHERE u.login = ?
                            AND p.password_hash = SHA2(?, 256)`;
            this.db.query(sql, [username, password], (error, rows) => {
                if (error) {
                    reject(errorWithCode(error));
                } else {
                    resolve(rows.length ? rows[0] : null);
                }
            });
        });
    }

    getUserConsent(user, client_id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * 
                           FROM auth.users_clients uc
                          WHERE uc.user_id = ? AND uc.client_id = ?`;
            this.db.query(sql, [user.user_id, client_id], (error, rows) => {
                if (error) {
                    reject(errorWithCode(error));
                } else {
                    resolve(!!rows.length);
                }
            });
        });
    }

    addUserConsent(username, client_id) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO auth.users_clients (user_id, client_id) VALUES (?, ?)`;
            this.db.query(sql, [username, client_id], (error, rows) => {
                if (error) {
                    reject(errorWithCode(error));
                } else {
                    resolve(true);
                }
            });
        });
    }
}

module.exports = Dao;
