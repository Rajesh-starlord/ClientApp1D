var express = require('express');
var router = express.Router();
require('dotenv').config();
const { Pool,Client } = require('pg');

const db = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

//const pool = new Pool(db);
const client = new Client(db);
try {
   client.connect();
} catch (e) {
    console.log('------DATABASE-CONNECTION-ERROR---------');
    client.end();
}
module.exports = client;
