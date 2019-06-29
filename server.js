const express = require("express");
const app = express();

const mysql = require("mysql");
const conn = mysql.createConnection(require("./db_config.json"));

conn.connect();

app.get("/", (req, res) => {
  conn.query("SELECT * FROM auth.users", (err, results, fields) =>
    res.send(err || JSON.stringify(results[0]))
  );
});

app.listen(3001, () => console.log("Auth server listening on port 3001..."));
