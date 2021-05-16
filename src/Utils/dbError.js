
let errorCodes = {
  "08003": "connection_does_not_exist",
  "08006": "connection_failure",
  "2F002": "modifying_sql_data_not_permitted",
  "57P03": "cannot_connect_now",
  "42601": "syntax_error",
  "42501": "insufficient_privilege",
  "42602": "invalid_name",
  "42622": "name_too_long",
  "42939": "reserved_name",
  "42703": "undefined_column",
  "42000": "syntax_error_or_access_rule_violation",
  "42P01": "undefined_table",
  "42P02": "undefined_parameter"
};

const errorLogger = (err,query)=>{

	var sqlString = '';
	if(typeof query === 'object'){
		sqlString = query.text;
	}else{
		sqlString = query;
	}

	console.log('=========================== DATABASE ERROR =================================')
	if (err === undefined) {
		console.log("No errors returned from Postgres")
	}

	else {

		if (err.message !== undefined) {
			console.log('ERROR message:', err.message)
		}
		if (err.code !== undefined) {
			console.log("Postgres error code:", err.code)
		}
		if (errorCodes[err.code] !== undefined) {
			console.log('Error code details:', errorCodes[err.code])
		}
	}

	console.log('severity:', err.severity)

	if (err.position !== undefined) {

		console.log("PostgreSQL error position:", err.position)

		// get the end of the error pos
		let end = err.position+7
		if (err.position+7 >= sqlString.length) {
		end = sqlString.length
		}

		// get the start position for SQL error
		let start = err.position-2
		if (err.position-2 <= 1) {
		start = 0
		}

		// log the partial SQL statement around error position
		console.log("---> " + sqlString.substring(start, end) + " <---")

	}

	if (err.code === undefined && err.position === undefined) {
		console.log("nUnknown Postgres error:", err)
	}
	console.log('=============================================================================')
  return err.message;
}

module.exports = errorLogger;
