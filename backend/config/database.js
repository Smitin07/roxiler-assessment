const { Pool } = require("pg");

const pool = new Pool({
  user: "smitinagulwar",
  host: "localhost",
  database: "roxiler_db",
  port: 5432
});

module.exports = pool;