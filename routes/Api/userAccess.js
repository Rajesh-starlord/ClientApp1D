var express = require('express');
const router = new express.Router();
const dbService = require('../../src/services/dbService');
const AuthService = require('../../src/Api/services/AuthService');
const UserService = require('../../src/Api/services/UserService');
const UserController = require('../../src/Api/Controllers/UserController');
const {userModel} = require('../../src/Models/Models');
const MailService  = require('../../src/Utils/mailService');
const { response } = require('express');
require('dotenv').config();

/*validate LOGIN page*/
router.post('/login', async function(req, res, next) {
  var userId = req.body.UserID;
  var password = req.body.Password;
  var response = {status:'',message:'',body:[]};
  try {
    response = await UserController.AuthenticateUser(userId,password);
  } catch (e) {
    response.message = 'login error';
    console.log(e);
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
      let mobileChk = await UserService.chkDuplicateMobileNo(mobile);
      if(!mobileChk.status){
        if(email.includes('@')){
          let emailChk = await UserService.chkDuplicateEmail(email);
          if(!emailChk.status){
      
            var mailOptions = {
              from: process.env.HostMail,
              to: email.trim(),
              subject: 'DesiiApp Login Otp',
              text: 'Your Login OTP for DesiiApp is '+otp
            };
            let mailresp = await MailService.sendMail(mailOptions);
            //console.log(mailresp);
            if(mailresp.status == 1){
              response.message = 'success';
            }else{
              response.message = 'Errorr In Sending Otp...Please try after sometime or check your email adress.';
            }
            /*let options = {
                method: 'POST',
                url: 'https://nexmo-nexmo-sms-verify-v1.p.rapidapi.com/send-verification-code',
                params: {phoneNumber: newUser.mobile, brand: 'default_application_5127621'},
                headers: {
                  'x-rapidapi-key': 'f6c4732c94mshba507199b03d5e6p1bb133jsna515d7d4267b',
                  'x-rapidapi-host': 'nexmo-nexmo-sms-verify-v1.p.rapidapi.com'
                }
              };
              otp  = await axios.request(options).then(response=>response.body).catch(function (error) {
              response.message = 'failed to send otp';
              console.error(error);
            });*/
          }else {
            response.message = 'Email Already Exists';
          }
        }else{
          response.message = 'Invalid Email';
        }
      }else{
        response.message = 'Mobile no Already Exists';
      }
    }else {
      response.message = 'UserID Already Exists';
    }
  } catch (e) {
    response.message = e.status === 0 ?'Errorr In Sending Otp...Please try after sometime or check your email adress.':'error';
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
  try {
    response = await UserController.createUser(newUser);
  } catch (e) {
    response.message = 'error';
    console.log(e);
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
  const email = req.body.email;
  try {
    if(email){
      let emailChk = await UserService.chkDuplicateEmail(email);
      let emailExists = emailChk && emailChk.status?emailChk.status:false;
      if(emailExists){
        var mailOptions = {
          from: process.env.HostMail,
          to: email.trim(),
          subject: 'DesiiApp Reset Password Otp',
          text: 'Your OTP for Password Reset in DesiiApp is '+otp
        };
        let mailresp = await MailService.sendMail(mailOptions);
        if(mailresp.status == 1){
          response.message = 'success';
        }else{
          response.message = 'Errorr In Sending Otp...Please try after sometime or check your email adress.';
        }
      }else{
        response.message = 'Email is not registered';
      }
    }else{
      response.message = 'Invalid Credentials'
    }
  } catch (e) {
    response.message = 'internal server error';
    response.message = e.status === 0 ?'Errorr In Sending Otp...Please try after sometime or check your email adress.':'error';
    console.log(e);
  }
  if(response.message === 'success'){
    response.status = 'success';
    response.body = {otp:otp}; 
  }else{
    response.status = 'failed';
  }
  res.send(response);
});

/********************** ADmin Changepwd *****************************************/
router.post('/changepassword',async function(req, res, next) {
  var response = {message:"",status:'',body:[]};
  if(req.body.Password == req.body.ConfPWD && (req.body.userId || req.body.email)){
    try {
      if(req.body.userId){
        response = await UserController.changePassword(req.body);
      }else if(req.body.email){
        response = await UserController.resetPassword(req.body);
      }
    } catch (e) {
      response.message = 'internal server error...';
      response.status = "failed";
      console.log(e);
    }
  }else{
    response.message = 'confirm password mismatch';
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
