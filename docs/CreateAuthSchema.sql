USE auth;

CREATE TABLE passwords (
	password_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	password_hash VARCHAR(80) NOT NULL
 );
 
CREATE TABLE users (
	user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
	login VARCHAR(30) NOT NULL, 
	email VARCHAR(50) NOT NULL, 
	password_id INT NOT NULL,
	FOREIGN KEY fk_passwords(password_id)
	REFERENCES passwords(password_id)
	ON UPDATE CASCADE
	ON DELETE RESTRICT
);

CREATE TABLE oauth_clients (
	client_id VARCHAR(20) NOT NULL PRIMARY KEY,
    client_name VARCHAR(100),
	client_detail VARCHAR(200),
    client_secret VARCHAR(100) NOT NULL,
    redirect_uri VARCHAR(100) NOT NULL
);

CREATE TABLE users_clients (
	user_id INT NOT NULL,
    client_id VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, client_id),
    FOREIGN KEY fk_users(user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
	ON DELETE RESTRICT,
    FOREIGN KEY fk_clients(client_id) REFERENCES oauth_clients(client_id)
    ON UPDATE CASCADE
	ON DELETE RESTRICT
);