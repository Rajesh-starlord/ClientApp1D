const { Pool,Client } = require('pg');
//const pool = require('../Utils/pg-pool');
const db = require('../Utils/dbConfig');
const errorLogger = require('../Utils/dbError');
const dbService = {

	/*** EXCECUTE ANY SELECT STATEMENT ***/

	execute:async function(query){
		let client = new Client(db);
		try {
		   client.connect();
		} catch (e) {
		    console.log('------DATABASE-CONNECTION-ERROR---------');
		    await client.end();
		}

		let result = await client.query(query).then(result=>result.rows)
					.catch(err=>errorLogger(err,query)).finally(async () => {await client.end();});
		return result;
	},

	/*** EXCECUTE ANY DML STATEMENT ***/

	executeUpdate:async function (query) {
		let client = new Client(db);
		try {
		   client.connect();
		} catch (e) {
		    console.log('------DATABASE-CONNECTION-ERROR---------');
		    await client.end();
		}
		let result = await client.query(query).then(result=>'success')
								.catch(err=>errorLogger(err,query)).finally(async () => {await client.end();})
		return result;
	}
}

module.exports = dbService;
