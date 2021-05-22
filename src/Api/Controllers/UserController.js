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
		try{
			response = await UserService.AuthenticateUser(id,password);
			if(response.status == true){
				response.message = 'login success';
			}else if(response.status == false){
				response.message = response.message?response.message:'failed';
			}
		}catch(e){
			response.message = 'login failed';
			console.log(e);
		}
		return response;
	},

	/*** CREATE USER ***/
	createUser:async function(user){
		console.log('UserController----->createUser called')
		let response = {status:'',message:'',body:[]};
		let message = '';
		try {
				message = await UserService.createUser(user);
		} catch (e) {
			message = "Failed To Create";
			console.log(e);
		}
		response.message = message;
		return response;
	},

	/*** get User data********/
	getUserDetails:async (userId)=> {
		console.log('UserController--->getUserDetails called');
		var response = {message:'',status:'',body:[]};
		try {
			let result = await UserService.getUserData(userId);
			response.body = result;
		}catch (e){
			console.log(e);
		}
		return response;
	},

	/*** CHANGE Password ********/
	changePassword:async function(data) {
		console.log('UserController--->changePassword called');
		var response = {message:"",status:'',body:[]};
		var message = '';
		try {
			let check = await UserService.isUserExists(data.userId);
			if(check){
				let status = await UserService.matchOldPassword(data.userId,data.Old_PWD);
				if(status){
					let result = await UserService.updatePassword(data.userId,data.Password);
					message = result;
				}else{
					message = 'Old Password mismatch';
				}
			}else{
				message = 'User Doesn\'t Exists';
			}
		} catch (e) {
			response.message = response.status = 'failed';
			console.log(e);
		} finally {
			if(message === 'success'){
				response.message = response.status = 'success';
			}else{
				response.message = message;
				response.status = 'failed';
			}
		}
		return response;
	},

	/*** reset Password ********/
	resetPassword:async function(data) {
		console.log('UserController--->resetPassword called');
		var response = {message:"",status:'',body:[]};
		var message = '';
		try {
			let check = await UserService.chkDuplicateEmail(data.email);
			if(check.status){
				let result = await UserService.resetPassword(data.email,data.Password);
				message = result;
			}else{
				message = 'User Doesn\'t Exists';
			}
		} catch (e) {
			response.message = response.status = 'failed';
			console.log(e);
		} finally {
			if(message === 'success'){
				response.message = 'Password Reset Sucessfull'
				response.status = 'success';
			}else{
				response.message = message;
				response.status = 'failed';
			}
		}
		return response;
	},

	/*** getAllUsers********/
	getAllUsers:async ()=> {
		console.log('UserController--->getAllUsers called');
		var response = {message:'',status:'',body:[]};
		try {
			response = await UserService.getAllUsers();
		}catch (e){
			response.message = 'error!!!';
			response.status = 'failed';
			console.log(e);
		}
		return response;
	},

	/*** getStates********/
	getStates:async ()=> {
		console.log('UserController--->getStates called');
		var response = {message:'',status:'',body:[]};
		try {
			let result = await UserService.getStates();
			if(typeof result != 'string'){
				response.body = result;
			}else {
				response.message = result;
			}
		}catch (e){
			console.log(e);
		}
		return response;
	},

	/*** getCity********/
	getCity:async (state)=> {
		console.log('UserController--->getCity called');
		var response = {message:'',status:'',body:[]};
		try {
			let result = await UserService.getCity(state);
			if(typeof result != 'string'){
				response.body = result;
			}else {
				response.message = result;
			}
		}catch (e){
			console.log(e);
		}
		return response;
	}

}

module.exports = UserController;
