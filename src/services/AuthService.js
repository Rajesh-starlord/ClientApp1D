var express = require('express');
var router = express.Router();
const dbService = require('./dbService');

const auth = {

	getCaptcha : function getCaptcha(){
		  let text  = 'A1BCDEF2FGHI3JKLMNO04PQRSTUVW9XYZabcdefghi5jklmno6pqrstu7v8xyz';
		  let array = text.split('');
		  for (var i = array.length - 1; i > 0; i--) {
                // Generate random number
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }

		  let cap = array.join("").substring(0,6);
		  return cap;
		},

	decodePassword: (pswd) => {
		  var digit = parseInt(pswd.charAt(pswd.length-1));
		  pswd = pswd.substring(0,pswd.length-1);
		  var position = 0;
		  if(digit == 1){
		    position = parseInt(pswd.slice(-1));
		    pswd = pswd.substring(0,pswd.length-1);
		  }else if (digit == 2) {
		    position = parseInt(pswd.slice(-2));
		    pswd = pswd.substring(0,pswd.length-2);
		  }else{
		    position = parseInt(pswd.slice(-3));
		    pswd = pswd.substring(0,pswd.length-3);
		  }
		  var slice1 = pswd.substring(0,position);
		  var slice2 = pswd.substring((position+12),pswd.length);
		  return slice1+slice2;
	},

	getAuthorizedURL:async function(ufunctions){
		let functions = await dbService.execute('select "TFM_Module","TFM_Function_Name","TFM_Function","TFM_Function_URL" from tbl_function_mstr ');
		let userFunctions = "";
		let url = [];
		try{
	 		if(functions!=null || functions!=""){
	 			userFunctions = ufunctions.split(',');
	 		}
	 		if(userFunctions == "All"){
	 			functions.forEach(fun=>{
					url.push(fun.TFM_Function_URL);
				})
	 		}else{
	 			functions.forEach(fun=>{
					userFunctions.forEach(data=>{
						if(parseInt(data) == fun.TFM_Function){
							url.push(fun.TFM_Function_URL);
						}
					})
				})
	 		}
	 	}catch(e){
	 		console.error(e);
	 	}
		return url;
	},

	getNavBarData:async function(role){

		//let userType = req.body.userType;
    let modules = await dbService.execute('select "TMM_Module","TMM_Modl_Name","TMM_Modl_Logo" from tbl_module_mstr where "TMM_Modl_DeletedFlag" = 0 order by "TMM_Module"');
		let functions = await dbService.execute('select "TFM_Module","TFM_Function_Name","TFM_Function","TFM_Function_URL" from tbl_function_mstr ');
		let query = {
			text:'select "modules","functions","role" from tbl_userrole_assgn where role = $1',
			values:[role]
		}
 		let userData = await  dbService.execute(query);
 		let userdata = userData[0];
 		let userModules  = "";
 		let userFunctions = "";

 		try{

	 		if(userdata.modules!=null || userdata.modules!=""){
	 			userModules = userdata.modules.split(',');
	 		}
	 		if(userModules == "All"){
	 			modules.forEach(mod=>{
					mod.checked = true;
				})
	 		}else{
	 			modules.forEach(mod=>{
					userModules.forEach(data=>{
						if(parseInt(data) == mod.TMM_Module){
							mod.checked = true;
						}
					})
				})
	 		}
	 	}catch(e){
	 		console.error(e);
	 	}

	 	try{
	 		if(userdata.functions!=null || userdata.functions!=""){
	 			userFunctions = userdata.functions.split(',');
	 		}
	 		if(userFunctions == "All"){
	 			functions.forEach(fun=>{
					fun.checked = true;
				})
	 		}else{
	 			functions.forEach(fun=>{
					userFunctions.forEach(data=>{
						if(parseInt(data) == fun.TFM_Function){
							fun.checked = true;
						}
					})
				})
	 		}
	 	}catch(e){
	 		console.error(e);
	 	}

	 	var navData = {};
	 	navData.modules = modules.filter(mod => mod.checked == true);
	 	navData.functions = functions.filter(fun => fun.checked == true);

	 	return navData;
	},

	getRemoteData:async (req) => {
		var data ={...req.session.user}
		data.ip=req.session.ip,
		data.host=req.headers.host,
		data.userId=req.session.user.userId
		if(req.session.user.logid != null || req.session.user.logid!=''){
			data.logid = parseInt(req.session.user.logid);
		}
		//console.log(data);
		return data;
	}

}

module.exports = auth;
