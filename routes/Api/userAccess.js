var express = require('express');
const router = new express.Router();
const AuthService = require('../../src/Api/services/AuthService');
const UserService = require('../../src/Api/services/UserService');
const UserController = require('../../src/Api/Controllers/UserController');
const {userModel} = require('../../src/Models/Models');
const MailService  = require('../../src/Utils/mailService');
require('dotenv').config();

/*validate LOGIN page*/
router.post('/login', async function(req, res, next) {
  var userId = req.body.UserID;
  var password = req.body.Password;
  var response = {status:'',message:'',body:[]};
  if(userId && password){
    try {
      response = await UserController.AuthenticateUser(userId,password);
    } catch (e) {
      response.message = 'login error';
      console.log(e);
    }
  }else{
    response.message = 'Invalid Key or Insufficient Data provided';
  }
  if(response.message == 'login success'){
    response.status = 'success';
  }else{
    response.status = 'failed';
  }
  res.send(response);
});

/*validate LOGIN page*/
router.post('/register', async function(req, res, next) {
  var response = {status:'',message:'',body:[]};
  var userData = req.body;
  var email = userData.email;
  var mobile = userData.mobile;
  var userId = userData.userId;
  const otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  try {
    let res = await UserService.isUserExists(userId);
    if(!res.status){
      let emailChk = await UserService.chkDuplicateEmail(email);
      if(!emailChk.status){
        let mobileChk = await UserService.chkDuplicateMobileNo(mobile);
        if(!mobileChk.status){
    
          let smsresp = await MailService.sendsmsOTP(otp,mobile);
          if(smsresp.LogID && smsresp.Message === 'Submitted Successfully'){
            response.message = 'success';
          }else{
            response.message = 'Errorr In Sending Otp...Please try after sometime or check your mobile number.';
          }
        }else {
          response.message = 'Mobile no Already Exists';
        }
      }else{
        response.message = 'Email Already Exists';
      }
    }else {
      response.message = 'UserID Already Exists';
    }
  } catch (e) {
    response.message = e.status === 0 ?'Errorr In Sending Otp...Please try after sometime or check your mobile number.':'error';
    console.log(e);
  }
  if(response.message == 'success'){
    response.status = 'success';
    response.body = [{otp:otp}];
  }else{
    response.status = 'failed';
  }
  res.send(response);
});

/**********************sign up*******************************/
router.post('/signup', async function(req, res, next) {
  var response = {status:'',message:'',body:[]};
  var userData = req.body;
  var newUser = new userModel(
    userData.userId,
    userData.userName,
    userData.password,
    userData.cnfPassword,
    userData.email,
    userData.mobile,
    userData.dob,
    userData.gender,
    userData.state,
    userData.city,
  );
  var dateChacked = true;
  if(userData.dob){
    if(userData.dob.split('/').length === 3){
      if(newUser.age < 15){
        dateChacked = false;
        response.message = 'Age Under 18 Is Not Alowed To Use This App.';
      }
    }else{
      dateChacked = false;
			message = "Invalid Date";
		}
  }
  if(dateChacked){
    try {
      response = await UserController.createUser(newUser);
    } catch (e) {
      response.message = 'error';
      console.log(e);
    }
  }
  if(response.message == 'success'){
    response.status = 'success';
  }else{
    response.status = 'failed';
  }
  res.send(response);
});

/*****************get states**********************/
router.get('/getStates', async function(req, res, next) {
  var response = {message:'',body:[]};
  try {
    response = await UserController.getStates();
  } catch (e) {
    response.message = 'error';
    console.log(e);
  }
  if(response.message == ''){
    response.message = 'success';
    response.status = 'success';
  }else{
    response.status = 'failed';
  }
  res.send(response);
});

/****************get City**********************/
router.get('/getCity', async function(req, res, next) {
  var response = {message:'',body:[]};
  var state = req.query.state;
  try {
    response = await UserController.getCity(state);
  } catch (e) {
    response.message = 'error';
    console.log(e);
  }
  if(response.message == ''){
    response.message = 'success';
    response.status = 'success';
  }else{
    response.status = 'failed';
  }
  res.send(response);
});

/************ forgot password***************/
router.post('/forgotpassword',async function(req, res, next) {
  var response = {message:"",status:'',body:[]};
  const otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  const mobile = req.body.mobile;
  try {
    if(mobile){
      let mobileChk = await UserService.chkDuplicateMobileNo(mobile);
      if(mobileChk.status){
        let smsresp = await MailService.sendsmsOTP(otp,mobile);
        if(smsresp.LogID && smsresp.Message === 'Submitted Successfully'){
          response.message = 'success';
        }else{
          response.message = 'Errorr In Sending Otp...Please try after sometime or check your mobile number.';
        }
      }else {
        response.message = 'Mobile no doesn\'t Exists';
      }
    }else {
      response.message = 'Invalid data provided';
    }
  } catch (e) {
    response.message = e.status === 0 ?'Errorr In Sending Otp...Please try after sometime or check your mobile number.':'error';
    console.log(e);
  }
  if(response.message == 'success'){
    response.status = 'success';
    response.body = [{otp:otp}];
  }else{
    response.status = 'failed';
  }
  res.send(response);
});

/********************** user Changepwd *****************************************/
router.post('/changepassword',async function(req, res, next) {
  var response = {message:"",status:'',body:[]};
  if(req.body.Password == req.body.ConfPWD){
    if(req.body.userId){
      try {
        response = await UserController.changePassword(req.body);
      } catch (e) {
        response.message = 'internal server error...';
        response.status = "failed";
        console.log(e);
      }
    }else{
      response.message = 'insufficient data...';
      response.status = "failed";
    }
  }else{
    response.message = 'confirm password mismatch';
    response.status = "failed";
  }
  res.send(response);
});

/********************** User reset pwd *****************************************/
router.post('/resetpassword',async function(req, res, next) {
  var response = {message:"",status:'',body:[]};
  if(req.body.Password == req.body.ConfPWD){
    if(req.body.mobile){
      try {
        response = await UserController.resetPassword(req.body);
      } catch (e) {
        response.message = 'internal server error...';
        response.status = "failed";
        console.log(e);
      }
    }else{
      response.message = 'insufficient data...';
      response.status = "failed";
    }
  }else{
    response.message = 'confirm password mismatch';
    response.status = "failed";
  }
  res.send(response);
});

/********************** User set firebasetocken *****************************************/
router.post('/mapusertoken',async function(req, res, next) {
  var response = {message:"",status:'',body:[]};
  if(req.body.userId && req.body.token){
    try {
      let status = await UserService.saveFirebaseToken(req.body.userId,req.body.token);
      if(status === 'success'){
        response.message = 'success';
        response.status = "success";
      }else{
        response.message = status;
        response.status = "failed";
      }
    } catch (e) {
      response.message = 'internal server error...';
      response.status = "failed";
      console.log(e);
    }
  }else{
    response.message = 'Insufficient data';
    response.status = "failed";
  }
  res.send(response);
});

/************ logout ***************/
router.get('/logout',async function(req, res, next) {
  //req.session.destroy();
  req.session.destroy((err) => {
    res.redirect('/') // will always fire after session is destroyed
  })
  res.redirect('/');
});

/********* ACCESS DENIED **********/
router.get('/access-denied',function(req,res){
  console.log('Access-Denied to ::::'+req.session.user.userId)
  res.render('access-denied');
})


/************ GET CAPTCHA *****************/
router.get('/getCaptcha', function(req, res, next) {
    var cap = AuthService.getCaptcha();
    req.session.captcha = cap;
    res.locals.captcha = cap;
    res.send({captcha:cap});
});

module.exports = router;
