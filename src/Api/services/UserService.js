const { user } = require('../../Utils/dbConfig');
const dbService = require('../services/dbService');
const { DateFormatter } = require('../Utils/CommonUtils');

const UserService = {
	/**** AUTHENTICATE USER ********/
	AuthenticateUser: async (id, password) => {
		console.log('UserService--->AuthenticateUser called')
		let status = false;
		var response = { status: '', message: '', body: [] };
		try {
			let sql = '';
			if (id && id.includes('@')) {
				sql = 'select ud.* ,cast((select count(*) from userposts where postedBy = ud.userid) as integer) as totalposts, s.state as statename,c.city_name as cityname from userdetail as ud left join state_list as s on s.id = ud.state::integer left join city as c on c.city_id = ud.city::integer where email = $1 and password = $2';
			} else if (id && id.trim().length === 10) {
				sql = 'select ud.* ,cast((select count(*) from userposts where postedBy = ud.userid) as integer) as totalposts, s.state as statename,c.city_name as cityname from userdetail as ud left join state_list as s on s.id = ud.state::integer left join city as c on c.city_id = ud.city::integer where mobileno = $1 and password = $2';
			}
			if (sql) {
				let query = {
					text: sql,
					values: [id, password]
				}
				let data = await dbService.execute(query);
				if (typeof data != 'string') {
					if (data.length > 0) {
						if (data[0].status != 'Active') {
							response.message = 'User Is InActive';
							response.status = false;
						} else {
							status = true;
							response.body = data;
							response.message = 'success';
							response.status = status;
						}
					}
				} else {
					response.message = data;
				}
			} else {
				response.message = 'Enter a valid email or mobile number';
			}
		} catch (e) {
			console.log(e);
		}
		return response;
	},

	//check user exists or not
	isUserExists: async (id) => {
		console.log('UserService--->isUserExists called')
		let status = false;
		var response = { status: status, body: [] };
		try {
			let query = {
				text: 'select "userid" from userdetail where "userid" = $1',
				values: [id]
			}
			let data = await dbService.execute(query);
			if (data.length > 0) {
				response.status = true;
				response.body = data[0];
			}
		} catch (e) {
			console.log(e);
		}
		return response;
	},

	chkDuplicateMobileNo: async (mobile) => {
		console.log('UserService--->chkDuplicateMobileNo called')
		let status = false;
		var response = { status: status, body: [] };
		try {
			let query = {
				text: 'select "userid" from userdetail where "mobileno" = $1',
				values: [mobile]
			}
			let data = await dbService.execute(query);
			if (data.length > 0) {
				response.status = true;
				response.body = data[0];
			}
		} catch (e) {
			console.log(e);
		}
		return response;
	},

	chkDuplicateEmail: async (email) => {
		console.log('UserService--->chkDuplicateEmail called')
		let status = false;
		var response = { status: status, body: [] };
		try {
			let query = {
				text: 'select "userid" from userdetail where "email" = $1',
				values: [email]
			}
			let data = await dbService.execute(query);
			if (data.length > 0) {
				response.status = true;
				response.body = data[0];
			}
		} catch (e) {
			console.log(e);
		}
		return response;
	},

	matchOldPassword: async function (id, password) {
		console.log('UserService--->matchOldPassword called')
		let query = {
			text: 'select "password" from userdetail where "userid" = $1',
			values: [id]
		}
		let status = false;
		try {
			let data = await dbService.execute(query);
			if (data.length > 0) {
				if (data[0].password == password) {
					status = true;
				}
			}
		} catch (e) {
			console.log(e);
		}

		return status;
	},

	updatePassword: async function (id, newPassword) {
		console.log('UserService--->updatePassword called')
		let query = {
			text: "update userdetail set password=$1 where userid = $2",
			values: [newPassword, id]
		}
		let status = '';
		try {
			status = await dbService.executeUpdate(query);
		} catch (e) {
			console.log(e);
		}
		return status;
	},

	resetPassword: async function (mobile, newPassword) {
		console.log('UserService--->resetPassword called')
		let query = {
			text: "update userdetail set password=$1 where mobileno = $2",
			values: [newPassword, mobile]
		}
		let status = '';
		try {
			status = await dbService.executeUpdate(query);
		} catch (e) {
			console.log(e);
		}
		return status;
	},

	//signup user api
	createUser: async (userData) => {
		console.log('UserService--->createUser called')
		userData.dob = userData.dob ? DateFormatter.getFormattedDate(userData.dob) : '';
		let query = {
			text: "call createuser($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
			values: [userData.userId, userData.userName, userData.password, userData.email.replace(/\s+/g, ' ').trim(),
			userData.mobile, userData.dob, userData.age, userData.gender, userData.state, userData.city]
		}
		let status = '';
		try {
			status = await dbService.executeUpdate(query);
		} catch (e) {
			console.log(e);
		}
		return status;
	},

	//get user data
	getUserData: async (userId) => {
		console.log('UserService--->getUserData called')
		console.log(userId);
		let query = {
			text: "select * from userdetail where userid = $1",
			values: [userId]
		}
		let result = [];
		try {
			result = await dbService.execute(query);
		} catch (e) {
			console.log(e);
		}
		return result[0];
	},

	//get user data
	getAllUsers: async () => {
		console.log('UserService--->getAllUsers called')
		var resp = { status: '', message: '', body: [] };
		let query = {
			text: "select * from userdetail",
			values: []
		}
		let result = [];
		try {
			result = await dbService.execute(query);
			if (typeof result == 'string') {
				resp.message = resp;
				resp.status = 'failed';
			} else {
				resp.message = 'success';
				resp.status = 'success';
				resp.body = result;
			}
		} catch (e) {
			resp.message = 'exception occured';
			resp.status = 'failed';
			console.log(e);
		}
		return resp;
	},

	getStates: async () => {
		console.log('UserService--->getStates called')
		let query = {
			text: "select * from state_list",
			values: []
		}
		let result = [];
		try {
			result = await dbService.execute(query);
		} catch (e) {
			console.log(e);
		}
		return result;
	},

	getCity: async (state) => {
		console.log('UserService--->getCity called')
		let query = {
			text: "select * from city where state = $1",
			values: [state]
		}
		let result = [];
		try {
			result = await dbService.execute(query);
		} catch (e) {
			console.log(e);
		}
		return result;
	},

	saveFirebaseToken: async (userid, token) => {
		console.log('UserService--->saveFirebaseToken called')
		let query = {
			text: "update userdetail set firebasetoken = $2  where userid = $1",
			values: [userid, token]
		}
		let result = [];
		try {
			result = await dbService.executeUpdate(query);
		} catch (e) {
			console.log(e);
		}
		return result;
	},

	reqForVerifiedId: async (userid) => {
		console.log('UserService--->reqForVerifiedId called');
    let response = { status: '', message: '', body: [] };
		let query = {
			text: "select * from reqestforverification($1)",
			values: [userid]
		}
		try {
			let result = await dbService.execute(query);
      console.log(result);
      if(result !=='string'){
        if(result && result[0] && result[0].message === 'success'){
          response.message = response.status = 'success';
        }else{
          response.message = result[0].message ? result[0].message : 'failed';
          response.status = 'failed';
        }
      }else{
        response.message = result;
        response.status = 'failed';
      }
		} catch (e) {
      response.message = response.status = 'failed';
			console.log(e);
		}
		return response;
	},

  verifyUser:async (userid,VerifiedBy) => {
		console.log('UserService--->verifyUser called');
    let response = { status: '', message: '', body: [] };
		let query = {
			text: "select * from verifyuser($1,$2)",
			values: [userid,VerifiedBy]
		}
		try {
			let result = await dbService.execute(query);
      if(result !=='string'){
        if(result && result[0] && result[0].message === 'success'){
          response.message = response.status = 'success';
        }else{
          response.message = result[0].message ? result[0].message : 'failed';
          response.status = 'failed';
        }
      }else{
        response.message = result;
        response.status = 'failed';
      }
		} catch (e) {
      response.message = response.status = 'failed';
			console.log(e);
		}
		return response;
	},

  updateMinFollowers:async (minfollowers) => {
		console.log('UserService--->updateMinFollowers called');
    let response = { status: '', message: '', body: [] };
		let query = {
			text: "update verificationinfo set maxfollowersforverifiedid = $1",
			values: [parseInt(minfollowers)]
		}
		try {
			let result = await dbService.executeUpdate(query);
      if(result === 'success'){
          response.message = response.status = 'success';
          response.body = { minfollowers };
      }else{
        response.message = result;
        response.status = 'failed';
      }
		} catch (e) {
      response.message = response.status = 'failed';
			console.log(e);
		}
		return response;
	}

}

module.exports = UserService;
