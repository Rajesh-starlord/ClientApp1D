const dbService  = require('../services/dbService');

const UserService = {
		/**** AUTHENTICATE USER ********/
		AuthenticateUser:async (id,password) => {
			console.log('UserService--->AuthenticateUser called')
			let status = false;
			try{
				let query = {
					text:'select userid from admindetail where userid = $1 and password = $2',
					values:[id,password]
				}
				let data = await dbService.execute(query);
				if(typeof data != 'string' ){
					if(data.length > 0){
						status = true;
					}
				}else{
					status = data;
				}
			}catch(e){
				console.log(e);
			}
			return status;
		},

		//check user exists or not
		isUserExists:async (id) => {
			console.log('UserService--->isUserExists called')
			let status = false;
			try{
				let query = {
					text:'select "userid" from admindetail where "userid" = $1',
					values:[id]
				}
				let data = await dbService.execute(query);
				if(data.length > 0){
					status = true;
				}
			}catch(e){
				console.log(e);
			}
			return status;
		},

		chkDuplicateMobileNo:async (mobile) => {
			console.log('UserService--->chkDuplicateMobileNo called')
			let status = false;
			try{
				let query = {
					text:'select "userid" from userdetail where "mobileno" = $1',
					values:[mobile]
				}
				let data = await dbService.execute(query);
				if(data.length > 0){
					status = true;
				}
			}catch(e){
				console.log(e);
			}
			return status;
		},

		matchOldPassword:async function (id,password) {
			console.log('UserService--->matchOldPassword called')
			let query = {
				text:'select "password" from admindetail where "userid" = $1',
				values:[id]
			}
			let status = false;
			try{
				let data = await dbService.execute(query);
				if(data.length > 0 ){
					if(data[0].password == password){
						status = true;
					}
				}
			}catch(e){
				console.log(e);
			}

			return status;
		},

		updatePassword:async function(id,newPassword){
			console.log('UserService--->updatePassword called')
			let query = {
				text:"update admindetail set password=$1 where userid = $2",
				values:[newPassword,id]
			}
			let status = '';
			try{
				status =await dbService.executeUpdate(query);
			}catch(e){
				console.log(e);
			}

			return status;
		},

		createUser:async (data) => {
			console.log('UserService--->createUser called')
			let query = {
				text:"call createuser($1,$2,$3,$4)",
				values:[data.UserID,data.Password,data.mobile,data.email]
			}
			let status = '';
			try{
				status = await dbService.executeUpdate(query);
			}catch(e){
				console.log(e);
			}
			return status;
		},

		registerIndustry:async (data) => {
			console.log('UserService--->registerIndustry called')
			let query = {
				text:"select * from Registration($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
				values:[data.userId,data.password,data.industry,data.pan,data.exeng,
					data.mobile,data.dist,data.email,'Pending',data.ip]
			}
			let message = '';
			try{
				message =await dbService.execute(query).then(result=>result[0].p_message);
			}catch(e){
				console.log(e);
			}
			return message;
		},

		//get user data
		getUserData:async (userId) => {
			console.log('UserService--->getUserData called')
			console.log(userId);
			let query = {
				text:"select * from userdetail where userid = $1",
				values:[userId]
			}
			let result = [];
			try{
				result = await dbService.execute(query);
			}catch(e){
				console.log(e);
			}
			return result[0];
		}
}

module.exports=UserService;
