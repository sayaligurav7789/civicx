
const { Pool } = require('pg');

const pg = require('pg');

require('dotenv').config();



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" 
    ? { rejectUnauthorized: false } 
    : false,
});

pool.connect()
  .then(() => console.log("Connected to Postgres"))
  .catch(err => console.error("Postgres connection error", err.stack));

module.exports = pool;