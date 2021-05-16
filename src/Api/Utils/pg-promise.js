var pgp = require('pg-promise');
const db = require('./db');
const pg = pgp('postgres://postgres:Nirmalya@123@localhost:5432/powerdemo');

module.exports = pg;