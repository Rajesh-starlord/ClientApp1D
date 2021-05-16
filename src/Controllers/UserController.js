const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

const UserService = require('../services/UserService');
const AuthService = require('../services/AuthService');
var dbService = require('../services/dbService');

const UserController = {
	/**** AUTHENTICATE USER ********/
	AuthenticateUser:async (id,password) => {
		console.log('UserController--->AuthenticateUser called')
		var response = {status:'',message:'',body:[]};
		password = sha256(password);
		try{
			let status = await UserService.AuthenticateUser(id,password);
			if(status == true){
				response.message = 'success';
			}else if(status == false){
				response.message = 'failed';
			}else {
				response.message = status;
			}
		}catch(e){
			response.message = 'error';
			console.log(e);
		}
		return response;
	},

	/*** CREATE USER ***/
	createUser:async function(data){
		console.log('UserController----->createUser called')
		let response = {status:'',message:'',body:[]};
		let message = '';
		try {
			let status = await UserService.isUserExists(data.UserID);
			if(!status){
				let password = data.Password;
				let passwordCnf = data.PasswordCnf;
				if(password === passwordCnf){
					let chkstatus = await UserService.chkDuplicateMobileNo(data.mobile);
					if(!chkstatus){
						data.Password = sha256(data.Password);
						message = await UserService.createUser(data);
					}else{
						message = "Mobile No Already Exists";
					}
				}else{
					message = "Password mismatch";
				}
			}else{
				message = "UserId Already Exists.";
			}
		} catch (e) {
			message = "Failed To Create";
			console.log(e);
		}
		response.message = message;
		return response;
	},

	/*** CHANGE Password ********/
	changePassword:async function(data) {
		console.log('UserController--->changePassword called')
		let check = await UserService.isUserExists(data.userId);
		var message = '';
		if(check){
			let status = await UserService.matchOldPassword(data.userId,sha256(sha256(data.Old_PWD)));
			if(status){
				let result = await UserService.updatePassword(data.userId,sha256(sha256(data.Password)));
				message = result;
			}else{
				message = 'Old Password mismatch';
			}
		}else{
			message = 'User Doesn\'t Exists';
		}
		return message;
	}
}

module.exports = UserController;
