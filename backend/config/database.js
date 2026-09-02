const { Pool } = require("pg");

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DB_SSL === "false"
          ? false
          : { rejectUnauthorized: false }
    }
  : {
      user: process.env.DB_USER || "smitinagulwar",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "roxiler_db",
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

module.exports = pool;